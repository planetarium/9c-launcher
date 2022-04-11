import type { SpawnSyncReturns } from "child_process";
import createIPCMock from "electron-mock-ipc";

const mocked = createIPCMock();
const ipcMain = mocked.ipcMain;
const ipcRenderer = mocked.ipcRenderer;

const txFiles = new Set<string>();
const signedTransactions = new Set<string>();

function handleMakeTx(ev: Electron.IpcMainEvent, ...args: unknown[]) {
  const fileName = String(args[args.length - 1]);
  txFiles.add(fileName);
  ev.returnValue = true;
}

ipcMain.on("monster-collect", handleMakeTx);

ipcMain.on("sign-tx", (ev, nonce: number, date: string, fileName: string) => {
  const signed = `${nonce}-${date}-${fileName}`;
  signedTransactions.add(signed);
  ev.returnValue = {
    status: 0,
    stdout: signed,
  } as SpawnSyncReturns<string>;
});

export { ipcMain, ipcRenderer };
