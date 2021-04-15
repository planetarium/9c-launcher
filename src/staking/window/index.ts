import { BrowserWindow, app, shell } from "electron";
import path from "path";
import logoImage from "./resources/logo.png";
import isDev from "electron-is-dev";

const createStakingWindow = (): BrowserWindow => {
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
    _win.loadURL("http://localhost:9000/staking.html");
    _win.webContents.openDevTools();
  } else {
    _win.loadFile("staking.html");
  }

  return _win;
};

export default createStakingWindow;
