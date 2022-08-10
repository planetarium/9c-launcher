import { ipcRenderer } from "electron";
import { assign, createMachine } from "xstate";
import { invokeIpcEvent } from "../utils/ipcEvent";

type MachineEvent =
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "DOWNLOAD" }
  | { type: "EXTRACT" }
  | { type: "DONE" };

interface MachineContext {
  progress?: number;
}

type UpdatePlayerMachineState =
  | {
      value: "download" | "extract";
      context: Required<MachineContext>;
    }
  | {
      value: "ok";
      context: {};
    };

export default createMachine<
  MachineContext,
  MachineEvent,
  UpdatePlayerMachineState
>(
  {
    context: { progress: 0 },
    id: "(machine)",
    initial: "ok",
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
                "update player download started",
                "DOWNLOAD"
              ),
          },
          {
            id: "triggerUpdate",
            src: () => ipcRenderer.invoke("start update player"),
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
            invokeIpcEvent<MachineEvent>(
              "update player download complete",
              "EXTRACT"
            ),
        },
      },
      extract: {
        entry: "resetProgress",
        on: {
          DONE: { target: "ok" },
        },
        invoke: {
          id: "extract",
          src: () =>
            invokeIpcEvent<MachineEvent>(
              "update player extract complete",
              "DONE"
            ),
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
