import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";
import isDev from "electron-is-dev";

let _win: BrowserWindow | null = null;

const createCollectionWindow = (): BrowserWindow => {
  _win = new BrowserWindow({
    width: 1166,
    height: 738,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  if (isDev) {
    _win.loadURL("http://localhost:9000/collection.html");
    _win.webContents.openDevTools();
  } else {
    _win.loadFile("collection.html");
  }

  return _win;
};

export default createCollectionWindow;
