import type { BrowserWindow } from "electron";
import type { EventName, ArgumentOf } from "src/v2/ipcTokens";

export function send<T extends EventName>(
  win: BrowserWindow,
  eventName: T,
  ...args: ArgumentOf<T>
) {
  win.webContents.send(eventName, ...args);
}
