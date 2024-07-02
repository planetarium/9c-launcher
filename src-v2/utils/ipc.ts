import { ipcRenderer, IpcRendererEvent } from "electron";
import { ArgumentOf, EventName } from "src/renderer/ipcTokens";

export function on<T extends EventName>(
  channel: T,
  listener: (event: IpcRendererEvent, ...args: ArgumentOf<T>) => void,
) {
  // @ts-expect-error - ipcRenderer.on is not typed
  ipcRenderer.on(channel, listener);
  // @ts-expect-error - ipcRenderer.off is not typed
  return () => void ipcRenderer.off(channel, listener);
}

export function once<T extends EventName>(
  channel: T,
  listener: (event: IpcRendererEvent, ...args: ArgumentOf<T>) => void,
) {
  // @ts-expect-error - ipcRenderer.on is not typed
  ipcRenderer.once(channel, listener);
}
