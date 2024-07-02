import type { BrowserWindow } from "electron";
import type { EventName, ArgumentOf } from "src/renderer/ipcTokens";

export function send<T extends EventName>(
  win: BrowserWindow,
  eventName: T,
  ...args: ArgumentOf<T>
) {
  win.webContents.send(eventName, ...args);
}
