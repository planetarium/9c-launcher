import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";
import isDev from "electron-is-dev";

let _win: BrowserWindow | null = null;

const createTransferWindow = (): BrowserWindow => {
  _win = new BrowserWindow({
    width: 970,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  if (isDev) {
    _win.loadURL("http://localhost:9000/transfer.html");
    _win.webContents.openDevTools();
  } else {
    _win.loadFile("transfer.html");
  }

  return _win;
};

export default createTransferWindow;
