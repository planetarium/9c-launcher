// 9C Unity Player 빌드를 nekoyume-unity 저장소에서 아티팩트로 남은 거 받아서 풀기
import { exec, execFile } from "child_process";
import fs from "fs";
import https from "https";
import os from "os";
import path from "path";
import stream from "stream";
import { promisify } from "util";

type Sha = string;
type Platform = "macOS" | "Windows";

const execWithPromise = promisify(exec);

// S3 "9c-artifacts.s3.amazonaws.com" 버킷에 nekoyume-unity 저장소의
// 마스터 푸시마다 빌드한 아티팩트가 올라간다.
// 참고: https://github.com/planetarium/nekoyume-unity/pull/2446
const DOWNLOAD_URL_BASE: string = "https://d3rgdei88xmq6p.cloudfront.net";
const FILENAMES: { [K in Platform]: string } = {
  macOS: "macOS.tar.gz",
  Windows: "Windows.zip",
};

function getCurrentPlatform(): Platform {
  const error = () => {
    throw new Error(`Unsupported platform: ${process.platform}`);
  };
  return process.platform == "win32"
    ? "Windows"
    : process.platform == "darwin"
    ? "macOS"
    : error();
}

async function getPlayerCommit(): Promise<Sha> {
  const { stdout, stderr } = await execWithPromise("git rev-parse HEAD", {
    cwd: path.join(__dirname, "..", "nekoyume-unity"),
  });
  return stdout.trim();
}

function downloadPlayerBinary(
  platform: Platform,
  commit: Sha,
  file: stream.Writable,
  progress:
    | ((downloaded: number, total: number | null) => Promise<void>)
    | null = null
): Promise<void> {
  const filename = FILENAMES[platform];
  const url = `${DOWNLOAD_URL_BASE}/${commit.toLowerCase().trim()}/${filename}`;
  return new Promise<void>((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode != null && res.statusCode >= 400) return reject(res);
        const contentLength = res.headers["content-length"];
        const totalSize =
          contentLength == null ? null : parseInt(contentLength);
        let downloadedSize = 0;
        res.setEncoding("binary");
        res.on("end", resolve);
        file.setDefaultEncoding("binary");
        res.pipe(file);
        res.prependListener("data", (chunk) => {
          downloadedSize += chunk.length;
          if (progress != null) {
            progress(downloadedSize, totalSize)
              .then(() => undefined)
              .catch(reject);
          }
        });
      })
      .on("error", reject);
  });
}

// extract-zip 패키지가 없을 때를 위한 PowerShell 외주 구현.
let unzip = (zipPath: string, extractTo: string): Promise<void> => {
  const args = [
    "-Command",
    'Expand-Archive -Force -Path "$env:ZIP_SRC" -DestinationPath "$env:ZIP_DST"',
  ];
  const options = {
    cwd: path.normalize(extractTo),
    windowsHide: true,
    env: {
      ...process.env,
      ZIP_SRC: path.normalize(zipPath),
      ZIP_DST: path.normalize(extractTo),
    },
  };
  return new Promise<void>((resolve, reject) => {
    execFile("powershell", args, options, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error}:\n${stderr}`));
      } else {
        resolve();
      }
    });
  });
};

try {
  const extractZip = require("extract-zip");
  unzip = async (zipPath: string, extractTo: string): Promise<void> => {
    await extractZip(zipPath, { dir: extractTo });
  };
} catch (_) {
  // extract-zip 패키지 없으면 그냥 PowerShell에 외주 준다.
}

async function untar(tarPath: string, extractTo: string): Promise<void> {
  const bzip2Extensions = [".tar.bz2", ".tbz"];
  const bzip2 = bzip2Extensions.some((ex) =>
    tarPath.toLowerCase().endsWith(ex)
  );
  const args = [`xvf${bzip2 ? "j" : "z"}`, path.normalize(tarPath)];
  const options = {
    cwd: path.normalize(extractTo),
    windowsHide: true,
  };
  return new Promise<void>((resolve, reject) => {
    execFile("tar", args, options, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error}:\n${stderr}`));
      } else {
        resolve();
      }
    });
  });
}

const DECOMPRESSOR: {
  [K in Platform]: (path: string, extractTo: string) => Promise<void>;
} = {
  macOS: untar,
  Windows: unzip,
};

async function bundlePlayerBinary(
  platform: Platform,
  playerCommit: Sha,
  bundleInto: string,
  options: {
    downloadProgress:
      | ((downloaded: number, total: number | null) => Promise<void>)
      | undefined;
    beforeDecompress:
      | ((path: string, extractTo: string) => Promise<void>)
      | undefined;
  }
): Promise<void> {
  const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "9c-"));
  const tmpPath = path.join(tmpdir, FILENAMES[platform]);
  const f = await fs.createWriteStream(tmpPath, {
    flags: "w",
    encoding: "binary",
  });
  try {
    await downloadPlayerBinary(
      platform,
      playerCommit,
      f,
      options.downloadProgress
    );
  } catch (e) {
    throw new Error(
      `Failed to download the player executable from ${playerCommit}.` +
        (e.statusCode == null ? "" : ` [status code: ${e.statusCode}]`)
    );
  } finally {
    f.close();
  }
  if (options.beforeDecompress != null) {
    await options.beforeDecompress(tmpPath, bundleInto);
  }
  await DECOMPRESSOR[platform](tmpPath, bundleInto);
  const unnecessaryDirs = // 론처 v1의 잔재들
    platform == "Windows"
      ? ["Nine Chronicles.exe", "qt-runtime"]
      : ["Nine Chronicles.app"];
  for (const unnecessaryDir of unnecessaryDirs) {
    try {
      await fs.promises.rmdir(path.join(bundleInto, unnecessaryDir), {
        recursive: true,
      });
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
  }
  await fs.promises.rmdir(tmpdir, { recursive: true });
}

async function main(): Promise<void> {
  const platform = getCurrentPlatform();
  const commit = await getPlayerCommit();
  const distPath = path.normalize(path.join(__dirname, "..", "dist"));
  try {
    await fs.promises.mkdir(distPath, { recursive: true });
  } catch (_) {
    // dist/ 디렉터리가 이미 있으면 안 만들어도 됨.
  }
  const appPath = path.join(
    distPath,
    platform == "Windows" ? "Nine Chronicles.exe" : "Nine Chronicles.app"
  );
  const fingerprintPath = path.join(distPath, ".9cfp");
  try {
    const fingerprint = await fs.promises.readFile(fingerprintPath, {
      encoding: "utf8",
    });
    const [eCommit, eMtime] = fingerprint.trim().split("\n");
    if (eCommit.toLowerCase().trim() === commit) {
      const appStat = await fs.promises.stat(appPath);
      if (parseInt(eMtime.trim()) == appStat.mtime.getTime()) {
        console.debug(`There is already ${appPath} which is from ${commit}.`);
        return;
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  let percent: number | null = null;
  await bundlePlayerBinary(platform, commit, distPath, {
    downloadProgress: async (got, total) => {
      const p = total == null ? null : ((got / total) * 100) | 0;
      if (p !== percent || total === null) {
        console.debug(
          (p === null ? "" : `[${p}%] `) +
            `Downloading the player executable from ${commit}... ` +
            (total === null ? `(${got})` : `(${got}/${total})`)
        );
        percent = p;
      }
    },
    beforeDecompress: async (archivePath, extractTo) => {
      console.debug(`Extracting ${archivePath} to ${extractTo}...`);
    },
  });

  try {
    const appStat = await fs.promises.stat(appPath);
    await fs.promises.writeFile(
      fingerprintPath,
      `${commit}\n${appStat.mtime.getTime()}`
    );
  } catch (e) {
    if (e.code !== "ENOENT") {
      console.log(e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
