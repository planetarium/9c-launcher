import { ipcRenderer, IpcRendererEvent } from "electron";
import type {
  EventObject,
  Event,
  InvokeCallback,
  AnyEventObject,
} from "xstate";
import type { EventName, ArgumentOf } from "src/renderer/ipcTokens";

export function listenIpcEvent(
  eventName: string,
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) {
  return () => {
    ipcRenderer.on(eventName, callback);
    return () => ipcRenderer.off(eventName, callback);
  };
}

type EventThunk<E extends EventObject, Arguments extends Array<any> = any[]> =
  | Event<E>
  | ((...args: Arguments) => Event<E>);

export function invokeIpcEvent<
  E extends EventObject,
  IPCEvent extends EventName
>(
  eventName: IPCEvent,
  eventThunk: EventThunk<E, ArgumentOf<IPCEvent>>
): InvokeCallback<AnyEventObject, E>;
export function invokeIpcEvent<E extends EventObject>(
  eventName: string,
  eventThunk: EventThunk<E>
): InvokeCallback<AnyEventObject, E>;
export function invokeIpcEvent<E extends EventObject>(
  eventName: string,
  ev: EventThunk<E>
): InvokeCallback<AnyEventObject, E> {
  return (cb) => {
    const handler = (...args: any[]) => {
      cb(typeof ev === "function" ? ev(...args.slice(1)) : ev);
    };
    ipcRenderer.on(eventName, handler);
    return () => ipcRenderer.off(eventName, handler);
  };
}
