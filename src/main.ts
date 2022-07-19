import path from "path";
import { app, BrowserWindow } from "electron";
import logoImage from "./resources/logo.png";

let win: BrowserWindow | null = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine) => {
    win?.show();
  });
  initializeApp();
}

async function initializeApp() {
  console.log("initializeApp");
  app.on("ready", async () => {
    win = await createWindow();
    });
  app.on("activate", async (event) => {
    event.preventDefault();
    win?.show();
  });
}

async function createWindow(): Promise<BrowserWindow> {
  const _win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), logoImage),
  });

  _win.setResizable(false); // see: https://github.com/electron/electron/issues/19565#issuecomment-867283465
  _win.loadFile("index.html");
}
