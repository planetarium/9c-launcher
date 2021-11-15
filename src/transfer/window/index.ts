import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";
import isDev from "electron-is-dev";

let _win: BrowserWindow | null = null;

const createTransferWindow = async (): Promise<BrowserWindow> => {
  _win = new BrowserWindow({
    width: 970,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  if (isDev) {
    await _win.loadURL("http://localhost:9000/transfer.html");
    await _win.webContents.openDevTools();
  } else {
    await _win.loadFile("transfer.html");
  }

  return _win;
};

export default createTransferWindow;
