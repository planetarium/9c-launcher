import {app} from 'electron';
import './security-restrictions';
import {platform} from 'node:process';
import updater from 'electron-updater';

import Window from './modules/UI/Window';
import Game from './modules/Game/Game';
import Keystore from './modules/Keystore/Keystore';
import Remote from './modules/Remote/Remote';
import Keyv from 'keyv';

export default class App {
  private window!: Window;
  private game!: Game;
  private keystore!: Keystore;
  private remote!: Remote;
  private state: Keyv;
  // Module Components are initialized in ready, if not. app must print error
  constructor() {
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
    this.window = new Window();
    this.state = new Keyv();
    this.registerEvents();
  }

  private ready = (): void => {
    try {
      updater.autoUpdater.checkForUpdatesAndNotify();
      this.window.restoreOrCreateWindow();
    } catch (e) {
      console.error('Failed create window:', e);
      //display dialog failed to create window
    }
    this.game = new Game(this.window.window, this.state);
    this.keystore = new Keystore(this.window.window, this.state);
    this.remote = new Remote(this.window.window, this.state);
  };

  private windowAllClosed = (): void => {
    if (platform !== 'darwin') {
      app.quit();
    }
  };

  private activate = (): void => {
    this.window.restoreOrCreateWindow();
  };

  private registerEvents = (): void => {
    app.on('ready', this.ready.bind(this));
    app.on('window-all-closed', this.windowAllClosed.bind(this));
    app.on('activate', this.activate.bind(this));
  };
}
