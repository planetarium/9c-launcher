import {app} from 'electron';
import './security-restrictions';
import {platform} from 'node:process';
import updater from 'electron-updater';
import type WindowManager from './UI/Window.js';

export default class App {
  windowManager: WindowManager;
  constructor(windowManager: WindowManager) {
    /**
     * Prevent electron from running multiple instances.
     */
    const isSingleInstance = app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      // Focus to last window app.emit("focusLastWindow");
      app.quit();
      process.exit(0);
    }

    /**
     * Disable Hardware Acceleration to save more system resources.
     */
    app.disableHardwareAcceleration();
    this.windowManager = windowManager;
    this.registerEvents();
  }

  private ready = (): void => {
    try {
      updater.autoUpdater.checkForUpdatesAndNotify();
      this.windowManager.restoreOrCreateWindow();
    } catch (e) {
      console.error('Failed create window:', e);
    }
  };

  private windowAllClosed = (): void => {
    if (platform !== 'darwin') {
      app.quit();
    }
  };

  private activate = (): void => {
    this.windowManager.restoreOrCreateWindow();
  };

  private registerEvents = (): void => {
    app.on('ready', this.ready.bind(this));
    app.on('window-all-closed', this.windowAllClosed.bind(this));
    app.on('activate', this.activate.bind(this));
  };
}
