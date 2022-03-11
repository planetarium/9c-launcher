import { ipcRenderer } from "electron";
import { assign, createMachine } from "xstate";
import { invokeIpcEvent } from "../utils/ipcEvent";

type MachineEvent =
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "DOWNLOAD" }
  | { type: "EXTRACT" }
  | { type: "COPY" }
  | { type: "DONE" };

interface MachineContext {
  progress?: number;
}

type UpdateMachineState =
  | {
      value: "download" | "extract";
      context: Required<MachineContext>;
    }
  | {
      value: "copy" | "ok";
      context: {};
    };

export default createMachine<MachineContext, MachineEvent, UpdateMachineState>(
  {
    initial: "ok",
    context: {
      progress: 0,
    },
    states: {
      ok: {
        on: {
          DOWNLOAD: { target: "download" },
        },
        invoke: [
          {
            id: "download",
            src: () =>
              invokeIpcEvent<MachineEvent>(
                "update download started",
                "DOWNLOAD"
              ),
          },
          {
            id: "triggerUpdate",
            src: () => ipcRenderer.invoke("start update"),
          },
        ],
      },
      download: {
        entry: "resetProgress",
        on: {
          EXTRACT: { target: "extract" },
          UPDATE_PROGRESS: { actions: "updateProgress" },
        },
        invoke: {
          id: "extract",
          src: () =>
            invokeIpcEvent<MachineEvent>("update download complete", "EXTRACT"),
        },
      },
      extract: {
        entry: "resetProgress",
        on: {
          COPY: { target: "copy" },
          UPDATE_PROGRESS: { actions: "updateProgress" },
        },
        invoke: {
          id: "extract",
          src: () =>
            invokeIpcEvent<MachineEvent>("update extract complete", "COPY"),
        },
      },
      copy: {
        entry: "resetProgress",
        on: {
          DONE: { target: "ok" },
        },
        invoke: {
          id: "extract",
          src: () =>
            invokeIpcEvent<MachineEvent>("update copy complete", "DONE"),
        },
      },
    },
  },
  {
    actions: {
      resetProgress: assign<MachineContext, MachineEvent>({ progress: 0 }),
      updateProgress: assign({
        progress: (context, event) =>
          event.type === "UPDATE_PROGRESS" ? event.progress : context.progress,
      }),
    },
  }
);
