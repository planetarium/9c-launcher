import { app, BrowserWindow, shell } from "electron";
import { enable as remoteEnable } from "@electron/remote/main";
import { join } from "path";
import log from "electron-log";
import logoImage from "src/renderer/resources/launcher-logo.png";

export let isQuitting = false;

export function setQuitting(value: boolean) {
  isQuitting = value;
}

export async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1300,
    height: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === "darwin" ? "hidden" : undefined,
    icon: join(app.getAppPath(), logoImage),
  });
  remoteEnable(win.webContents);

  // 렌더러가 죽거나(흰화면) 멈추는 상황을 main.log에 남긴다.
  // 렌더러가 hang이면 renderer.log에는 아무것도 안 남으므로 여기서 잡는 것이 핵심.
  win.webContents.on("render-process-gone", (_event, details) => {
    log.error(
      `[renderer] render-process-gone: reason=${details.reason}, exitCode=${details.exitCode}`,
    );
  });
  win.webContents.on("unresponsive", () => {
    log.error("[renderer] webContents became unresponsive (possible hang)");
  });
  win.webContents.on("responsive", () => {
    log.info("[renderer] webContents responsive again");
  });
  win.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      // -3(ERR_ABORTED)은 정상 취소(리다이렉트 등)이므로 무시.
      if (!isMainFrame || errorCode === -3) return;
      log.error(
        `[renderer] did-fail-load: code=${errorCode}, desc=${errorDescription}, url=${validatedURL}`,
      );
    },
  );

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://stately.ai/viz?inspect")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          frame: true,
          resizable: true,
          webPreferences: {
            nodeIntegration: false,
          },
        },
      };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });

  win.on("close", function (event: any) {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    await win.loadURL("http://localhost:9000/index.html");
    await win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile("index.html");
  }

  return win;
}
