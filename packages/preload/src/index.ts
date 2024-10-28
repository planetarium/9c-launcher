/**
 * @module preload
 */

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('game', {
  startGame: () => ipcRenderer.invoke('start-game'),
  endGame: () => ipcRenderer.invoke('end-game'),
  //onGameState: () => ipcRenderer.on('game-state', (_event, value) => callback(value)),
});
