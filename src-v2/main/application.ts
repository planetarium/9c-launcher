import { app, BrowserWindow, shell } from "electron";
import { enable as remoteEnable } from "@electron/remote/main";
import { join } from "path";
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
