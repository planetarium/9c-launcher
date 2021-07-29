import { app, BrowserWindow, shell } from "electron";
import { join } from "path";
import logoImage from "../resources/logo.png";
import isDev from "electron-is-dev";

export async function createWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1300,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: join(app.getAppPath(), logoImage),
  });

  if(isDev) {
    await win.loadURL("http://localhost:9000/v2.html");
    await win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile("v2.html");
  }

  win.webContents.on("new-window", function (event: any, url: string) {
    event.preventDefault();
    shell.openExternal(url);
  });

  return win;
}
