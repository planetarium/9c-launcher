import { app, BrowserWindow, shell } from "electron";
import { enable as remoteEnable } from "@electron/remote/main";
import { join } from "path";
import logoImage from "../resources/logo.png";

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
  win.webContents.on("new-window", function (
    event,
    url: string,
    _a,
    _,
    options
  ) {
    if (url.startsWith("https://stately.ai/viz?inspect")) {
      options.frame = true;
      options.resizable = true;
      options.webPreferences!.nodeIntegration = false;
    } else {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.on("close", function (event: any) {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  if (!app.isPackaged) {
    await win.loadURL("http://localhost:9000/v2.html");
    await win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile("v2.html");
  }

  return win;
}
