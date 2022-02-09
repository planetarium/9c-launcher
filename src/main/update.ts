import { encode, decode, BencodexDict } from "bencodex";
import { DownloadItem, app } from "electron";
import { download, Options as ElectronDLOptions } from "electron-dl";
import extractZip from "extract-zip";
import * as utils from "../utils";
import { IDownloadProgress } from "src/interfaces/ipc";
import { tmpName } from "tmp-promise";
import { DownloadBinaryFailedError } from "./exceptions/download-binary-failed";
import { get as getConfig } from "../config";
import path from "path";
import fs from "fs";
import Headless from "./headless/headless";
import lockfile from "lockfile";
import { spawn as spawnPromise } from "child-process-promise";

const lockfilePath = path.join(path.dirname(app.getPath("exe")), "lockfile");

interface Update {
  current: number;
  newer: number;
  extras: string;
}

export async function checkForUpdates(
  standalone: Headless
): Promise<Update | null> {
  const peerInfos: string[] = getConfig("PeerStrings");
  if (peerInfos.length > 0) {
    const peerApvToken = standalone.apv.query(peerInfos[0]);
    if (peerApvToken !== null) {
      if (
        standalone.apv.verify(
          getConfig("TrustedAppProtocolVersionSigners"),
          peerApvToken
        )
      ) {
        const peerApv = standalone.apv.analyze(peerApvToken);
        const localApvToken = getConfig("AppProtocolVersion");
        const localApv = standalone.apv.analyze(localApvToken);

        return {
          current: localApv.version,
          newer: peerApv.version,
          extras: encode(peerApv.extra).toString("hex"),
        };
      } else {
        console.log(
          `Ignore APV[${peerApvToken}] due to failure to validating.`
        );
      }
    }
  }
  return null;
}

export interface IUpdateOptions {
  downloadStarted(): Promise<void>;
  relaunchRequired(): void;
}

export async function update(
  update: Update,
  listeners: IUpdateOptions,
  win: Electron.BrowserWindow
) {
  const localVersionNumber: number = update.current;
  const peerVersionNumber: number = update.newer;
  const peerVersionExtra: string = update.extras;

  if (peerVersionNumber <= localVersionNumber) {
    return;
  }

  if (lockfile.checkSync(lockfilePath)) {
    console.log(
      "'encounter different version' event seems running already. Stop this flow."
    );
    return;
  }

  try {
    lockfile.lockSync(lockfilePath);
    console.log(
      "Created 'encounter different version' lockfile at ",
      lockfilePath
    );
  } catch (e) {
    console.error("Error occurred during trying lock.");
    throw e;
  }

  await listeners.downloadStarted();

  if (win === null) {
    console.log("Stop update process because win is null.");
    return;
  }

  console.log("peerVersionExtra (hex):", peerVersionExtra);
  const buffer = Buffer.from(peerVersionExtra, "hex");
  console.log("peerVersionExtra (bytes):", buffer);
  const extra = decode(buffer) as BencodexDict;
  console.log("peerVersionExtra (decoded):", JSON.stringify(extra)); // 다른 프로세스라 잘 안보여서 JSON으로...
  const macOSBinaryUrl = extra.get("macOSBinaryUrl") as string;
  const windowsBinaryUrl = extra.get("WindowsBinaryUrl") as string;
  console.log("macOSBinaryUrl: ", macOSBinaryUrl);
  console.log("WindowsBinaryUrl: ", windowsBinaryUrl);
  const downloadUrl =
    process.platform === "win32"
      ? windowsBinaryUrl
      : process.platform === "darwin"
      ? macOSBinaryUrl
      : null;

  if (downloadUrl == null) {
    console.log(`Stop update process. Not support ${process.platform}.`);
    return;
  }

  win?.webContents.send("update download started");
  // TODO: 이어받기 되면 좋을 듯
  const options: ElectronDLOptions = {
    onStarted: (downloadItem: DownloadItem) => {
      console.log("Starts to download:", downloadItem);
    },
    onProgress: (status: IDownloadProgress) => {
      const percent = (status.percent * 100) | 0;
      console.log(
        `Downloading ${downloadUrl}: ${status.transferredBytes}/${status.totalBytes} (${percent}%)`
      );
      win?.webContents.send("update download progress", status);
    },
    directory: app.getPath("temp"),
  };
  console.log("Starts to download:", downloadUrl);
  let dl: DownloadItem | null | undefined;
  try {
    dl = await download(win, downloadUrl, options);
  } catch (error) {
    win.webContents.send("go to error page", "download-binary-failed");
    throw new DownloadBinaryFailedError(downloadUrl);
  }

  win.webContents.send("update download complete");
  const dlFname = dl?.getFilename();
  const dlPath = dl?.getSavePath();
  console.log("Finished to download:", dlPath);

  const extractPath =
    process.platform == "darwin" // .app으로 실행한 건지 npm run dev로 실행한 건지도 확인해야 함
      ? path.dirname(path.dirname(path.dirname(path.dirname(app.getAppPath()))))
      : path.dirname(path.dirname(app.getAppPath()));
  console.log("The 9C app installation path:", extractPath);

  const appDirName = app.getAppPath();
  // FIXME: "config.json" 이거 하드코딩하지 말아야 함
  const configFileName = "config.json";

  // 압축 해제하기 전에 기존 설정 꿍쳐둔다. 나중에 기존 설정 내용이랑 새 디폴트 값들이랑 합쳐야 함.
  const configPath = path.join(appDirName, configFileName);
  const bakConfig = JSON.parse(
    await fs.promises.readFile(configPath, { encoding: "utf-8" })
  );
  console.log("The existing configuration:", bakConfig);

  if (process.platform == "win32") {
    // 윈도는 프로세스 떠 있는 실행 파일을 덮어씌우거나 지우지 못하므로 이름을 바꿔둬야 함.
    const src = app.getPath("exe");
    const basename = path.basename(src);
    const dirname = path.dirname(src);
    const dst = path.join(dirname, "bak_" + basename);
    await fs.promises.rename(src, dst);
    console.log("The executing file has renamed from", src, "to", dst);

    // TODO: temp directory 앞에 9c-updater- 접두어
    const tempDir = await tmpName();

    // ZIP 압축 해제
    console.log("Start to extract the zip archive", dlPath, "to", tempDir);

    await extractZip(dlPath, {
      dir: tempDir,
      onEntry: (_, zipfile) => {
        const progress = zipfile.entriesRead / zipfile.entryCount;
        win?.webContents.send("update extract progress", progress);
      },
    });
    win.webContents.send("update extract complete");
    console.log("The zip archive", dlPath, "has extracted to", tempDir);
    win.webContents.send("update copying progress");
    await utils.copyDir(tempDir, extractPath);
    console.log("Copied extracted files from", tempDir, "to", extractPath);
    try {
      await fs.promises.rmdir(tempDir, { recursive: true });
      console.log("Removed all temporary files from", tempDir);
    } catch (e) {
      console.warn("Failed to remove temporary files from", tempDir, "\n", e);
    }
    win.webContents.send("update copying complete");
  } else if (process.platform == "darwin") {
    // .tar.{gz,bz2} 해제
    const lowerFname = dlFname.toLowerCase();
    const bz2 = lowerFname.endsWith(".tar.bz2") || lowerFname.endsWith(".tbz");
    console.log(
      "Start to extract the tarball archive",
      dlPath,
      "to",
      extractPath
    );
    try {
      await spawnPromise(
        "tar",
        [`xvf${bz2 ? "j" : "z"}`, dlPath, "-C", extractPath],
        { capture: ["stdout", "stderr"] }
      );
    } catch (e) {
      console.error(`${e}:\n`, e.stderr);
      throw e;
    }
    console.log(
      "The tarball archive",
      dlPath,
      "has extracted to ",
      extractPath
    );
  } else {
    console.warn("Not supported platform.");
    return;
  }

  // 압축을 푼 뒤 압축 파일은 제거합니다.
  await fs.promises.unlink(dlPath);

  // 설정 합치기
  const newConfig = JSON.parse(
    await fs.promises.readFile(configPath, { encoding: "utf-8" })
  );
  const config = {
    ...bakConfig,
    ...newConfig,
  };
  await fs.promises.writeFile(configPath, JSON.stringify(config), "utf-8");
  console.log(
    "The existing and new configuration files has been merged:",
    config
  );

  lockfile.unlockSync(lockfilePath);
  console.log(
    "Removed 'encounter different version' lockfile at ",
    lockfilePath
  );

  // 재시작
  listeners.relaunchRequired();

  /*
      Electron이 제공하는 autoUpdater는 macOS에서는 무조건 코드사이닝 되어야 동작.
      당장은 쓰고 싶어도 여건이 안 된다.

      FIXME: 이후 Squirell를 붙여서 업데이트하게 바꿉니다.

      const { path: tmpPath } = await tmp.file({
        postfix: ".json",
        discardDescriptor: true,
      });
      const tmpFile = await fs.promises.open(tmpPath, "w");
      const feedData = {
        url: downloadUrl,
      };

      await tmpFile.writeFile(JSON.stringify(feedData), "utf8");
      console.log(`Wrote a temp feed JSON file:`, tmpPath);
      autoUpdater.setFeedURL({ url: `file://${tmpPath}` });

      autoUpdater.on("error", (message) =>
        console.error("AUTOUPDATER:ERROR", message)
      );
      autoUpdater.on("checking-for-update", () =>
        console.error("AUTOUPDATER:CHECKING-FOR-UPDATE")
      );
      autoUpdater.on("update-available", () =>
        console.error("AUTOUPDATER:UPDATE-AVAILABLE")
      );
      autoUpdater.on("update-not-available", () =>
        console.error("AUTOUPDATER:UPDATE-NOT-AVAILABLE")
      );
      autoUpdater.on(
        "update-downloaded",
        (event, releaseNotes, releaseName, releaseDate, updateURL) =>
          console.error(
            "AUTOUPDATER:UPDATE-DOWNLOADED",
            event,
            releaseNotes,
            releaseName,
            releaseDate,
            updateURL
          )
      );
      autoUpdater.on("before-quit-for-update", () =>
        console.error("AUTOUPDATER:BEFORE-QUIT-FOR-UPDATE")
      );

      autoUpdater.checkForUpdates();
      */
}

export function isUpdating() {
  return lockfile.checkSync(lockfilePath);
}

/**
 * lockfile lock이 걸려있을 경우 unlock합니다.
 */
export function cleanUpLockfile() {
  if (lockfile.checkSync(lockfilePath)) {
    lockfile.unlockSync(lockfilePath);
  }
}
