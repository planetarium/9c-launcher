import { BrowserWindow, app, shell, ipcMain } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";
import isDev from "electron-is-dev";


const createCollectionWindow = (): BrowserWindow => {
  let _win = new BrowserWindow({
    width: 984,
    height: 552.6,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  console.log(app.getAppPath());

  if (isDev) {
    _win.loadURL("http://localhost:9000/collection.html");
    _win.webContents.openDevTools();
  } else {
    _win.loadFile("collection.html");
  }

  return _win;
};

export default createCollectionWindow;
