import { isDev } from "src/utils/common";
import {
  preloadMainScriptPathDev,
  preloadMainScriptPathProd,
} from "src/utils/main/url";

export const WINDOW_DEFAULT_OPTIONS: Electron.BrowserWindowConstructorOptions =
  {
    width: 1300,
    height: 768,
    resizable: false,
    frame: false,
    titleBarStyle: process.platform === "darwin" ? "hidden" : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: isDev ? preloadMainScriptPathDev : preloadMainScriptPathProd, // preload selector
    },
    //icon: join(app.getAppPath(), logoImage),
  };

export const LOADING_DEFAULT_OPTIONS: Electron.BrowserWindowConstructorOptions =
  {
    width: 400,
    height: 400,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
  };

export const LAUNCHER_PROTOCOL = "ninechronicles-launcher";
