import { app, BrowserWindow, shell } from "electron";
import { join } from "path";
import logoImage from "../resources/logo.png";
import isDev from "electron-is-dev";

export async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1300,
    height: 768,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true,
      affinity: "v2",
    },
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    icon: join(app.getAppPath(), logoImage),
  });

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
    } else event.preventDefault(), shell.openExternal(url);
  });

  if (isDev) {
    await win.loadURL("http://localhost:9000/v2.html");
    await win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile("v2.html");
  }

  return win;
}
