import {app, ipcMain} from 'electron';
import type {ChildProcessWithoutNullStreams} from 'node:child_process';
import {spawn} from 'node:child_process';
import {DEFAULT_PLAYER_INSTALL_PATH} from '/@/constants/os';
import {BrowserWindow} from 'electron/main';
import Keyv from 'keyv';
// import { isUpdating } from "/@/modules/updater"

export default class Game {
  private _gameNode: ChildProcessWithoutNullStreams | null = null;
  private _window: BrowserWindow;
  private _keyv: Keyv;

  constructor(window: BrowserWindow, keyv: Keyv) {
    this._window = window;
    this._keyv = keyv;
    this.registerEvents();
  }

  private isStartable = (): boolean => {
    // Pre-start Check if unable to start
    // Update, Game has started, Maintenance etc
    console.log('[GAME]: Pre-game start check');
    if (this._gameNode !== null) {
      console.error('Game is already running.');
      return false;
    }

    /**
    if (isUpdating()) {
      console.error('Cannot launch game while updater is running.');
      return false;
    }
    */

    return true;
  };

  private startGame = (): void => {
    if (this.isStartable()!) {
      this._window.webContents.send('game-state', false);
      return;
    }

    // playerArgs needs to be passed also from planetary handler & config reader
    this._gameNode = spawn(DEFAULT_PLAYER_INSTALL_PATH /**playerArgs */);
    this._gameNode.on('error', err => console.log(err));
    this._gameNode.on('close', () => {
      this._gameNode = null;
      this._window.webContents.send('game-state', false);
    });

    if (this._gameNode !== null) {
      this._window.webContents.send('game-state', true);
    }
  };

  private endGame = (): void => {
    if (this._gameNode === null) {
      this._window.webContents.send('game-state', false);
      console.error('game already closed');
      return;
    }
    this._gameNode.kill();
  };

  private registerEvents = (): void => {
    ipcMain.on('start-game', this.startGame.bind(this));
    ipcMain.on('end-game', this.endGame.bind(this));
  };
}
