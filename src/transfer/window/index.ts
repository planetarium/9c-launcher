import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";


let _win: BrowserWindow | null = null;

const createTransferWindow = async (): Promise<BrowserWindow> => {
  _win = new BrowserWindow({
    width: 970,
    height: 650,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  if (app.isPackaged) {
    await _win.loadURL("http://localhost:9000/transfer.html");
    await _win.webContents.openDevTools();
  } else {
    await _win.loadFile("transfer.html");
  }

  return _win;
};

export default createTransferWindow;
