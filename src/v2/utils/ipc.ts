import { ipcRenderer, IpcRendererEvent } from "electron";
import { ArgumentOf, EventName } from "../ipcTokens";

export function on<T extends EventName>(
  channel: T,
  listener: (event: IpcRendererEvent, ...args: ArgumentOf<T>) => void
) {
  // @ts-expect-error - ipcRenderer.on is not typed
  ipcRenderer.on(channel, listener);
  return () => off(channel, listener);
}

export function off<T extends EventName>(
  channel: T,
  listener: (event: IpcRendererEvent, ...args: ArgumentOf<T>) => void
) {
  // @ts-expect-error - ipcRenderer.on is not typed
  ipcRenderer.off(channel, listener);
}
