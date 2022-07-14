import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";

let _win: BrowserWindow | null = null;

const createCollectionWindow = async (): Promise<BrowserWindow> => {
  _win = new BrowserWindow({
    width: 1166,
    height: 738,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  if (!app.isPackaged) {
    await _win.loadURL("http://localhost:9000/collection.html");
    await _win.webContents.openDevTools();
  } else {
    await _win.loadFile("collection.html");
  }

  return _win;
};

export default createCollectionWindow;
