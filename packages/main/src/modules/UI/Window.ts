import {app, BrowserWindow, ipcMain} from 'electron';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

export default class Window {
  public window!: BrowserWindow;
  public isReady: boolean = false;

  constructor() {}

  private createWindow() {
    this.window = new BrowserWindow({
      width: 1280,
      height: 768,
      frame: false,
      resizable: false,
      autoHideMenuBar: true,
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
        webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
        preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
      },
    });

    this.registerEvents();

    /**
     * Load the main page of the main window.
     */
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
      /**
       * Load from the Vite dev server for development.
       */
      this.window.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
    } else {
      /**
       * Load from the local file system for production and test.
       *
       * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
       * when path contains special characters like `#`.
       * Let electron handle the path quirks.
       * @see https://github.com/nodejs/node/issues/12682
       * @see https://github.com/electron/electron/issues/6869
       */
      this.window.loadFile(
        fileURLToPath(new URL('./../../renderer/dist/index.html', import.meta.url)),
      );
    }
  }
  /**
   * Restore an existing BrowserWindow or Create a new BrowserWindow.
   */
  public restoreOrCreateWindow() {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window === undefined) {
      this.createWindow();
    }

    if (this.window.isMinimized()) {
      this.window.restore();
    }

    this.window.focus();
  }

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  private setReady() {
    this.isReady = true;
  }

  private show() {
    this.window.show();
    if (import.meta.env.DEV) {
      this.window?.webContents.openDevTools();
    }
  }
  private registerEvents() {
    this.window.on('ready-to-show', this.setReady.bind(this));
    ipcMain.on('front-ready', this.show.bind(this));
  }
}
