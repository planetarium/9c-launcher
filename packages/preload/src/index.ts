/**
 * @module preload
 */
import {ipcRenderer} from 'electron';
import {contextBridge} from 'electron';

const startGame = () => ipcRenderer.send('start-game');
const endGame = () => ipcRenderer.send('end-game');

const gameState = (callback: (arg: boolean) => {}) => {
  ipcRenderer.on('game-state', (_event, arg: boolean) => {
    callback(arg);
  });
};

const frontReady = () => ipcRenderer.send('front-ready');

function getKeys(callback: (arg: string[]) => {}) {
  ipcRenderer.on('get-keys', (_event, arg) => {
    callback(arg);
  });
}

contextBridge.exposeInMainWorld('game', {
  startGame,
  endGame,
  gameState
});

contextBridge.exposeInMainWorld('renderer', {
  frontReady,
});

contextBridge.exposeInMainWorld('keystore', {
  getKeys,
});
