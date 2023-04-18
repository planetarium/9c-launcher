import { ipcRenderer } from "electron";
import { assign, createMachine, interpret } from "xstate";
import { invokeIpcEvent } from "src/utils/ipcEvent";

type MachineEvent =
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "PLAYER_DOWNLOAD" }
  | { type: "LAUNCHER_DOWNLOAD" }
  | { type: "EXTRACT" }
  | { type: "COPY" }
  | { type: "DONE" }
  | { type: "ERROR"; error: string; data?: any };

interface MachineContext {
  error?: string;
  data?: any;
  progress?: number;
}

type UpdateMachineState =
  | {
      value: "download" | "extract" | "error";
      context: Required<MachineContext>;
    }
  | {
      value: "copy" | "ok";
      context: {};
    };

const playerUpdate = {
  key: "playerUpdate",
  context: { progress: 0 },
  initial: "download",
  states: {
    download: {
      entry: "resetProgress",
      on: {
        EXTRACT: { target: "extract" },
        UPDATE_PROGRESS: { actions: "updateProgress" },
      },
      invoke: {
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
        UPDATE_PROGRESS: { actions: "updateProgress" },
      },
      invoke: [
        {
          src: () =>
            invokeIpcEvent<MachineEvent>(
              "update player extract complete",
              "DONE"
            ),
        },
        {
          src: () =>
            invokeIpcEvent<MachineEvent>(
              "update download started",
              "LAUNCHER_DOWNLOAD"
            ),
        },
      ],
    },
  },
  on: {
    DONE: { target: "ok" },
    LAUNCHER_DOWNLOAD: { target: "launcherUpdate" },
  },
};

const launcherUpdate = {
  key: "launcherUpdate",
  context: { progress: 0 },
  initial: "download",
  states: {
    download: {
      entry: "resetProgress",
      on: {
        EXTRACT: { target: "extract" },
        UPDATE_PROGRESS: { actions: "updateProgress" },
      },
      invoke: {
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
        src: () =>
          invokeIpcEvent<MachineEvent>("update extract complete", "COPY"),
      },
    },
    copy: {
      entry: "resetProgress",
      invoke: {
        src: () =>
          invokeIpcEvent<MachineEvent>("update copying complete", "DONE"),
      },
    },
  },
  on: {
    DONE: { target: "ok" },
  },
};

export const updateMachine = createMachine<
  MachineContext,
  MachineEvent,
  UpdateMachineState
>(
  {
    id: "(machine)",
    initial: "ok",
    context: {},
    states: {
      ok: {
        invoke: [
          {
            id: "playerDownload",
            src: () =>
              invokeIpcEvent<MachineEvent>(
                "update player download started",
                "PLAYER_DOWNLOAD"
              ),
          },
          {
            id: "launcherDownload",
            src: () =>
              invokeIpcEvent<MachineEvent>(
                "update download started",
                "LAUNCHER_DOWNLOAD"
              ),
          },
          {
            id: "triggerUpdate",
            src: () => ipcRenderer.invoke("start update"),
          },
        ],
        on: {
          PLAYER_DOWNLOAD: {
            target: "playerUpdate",
          },
          LAUNCHER_DOWNLOAD: {
            target: "launcherUpdate",
          },
        },
      },
      playerUpdate,
      launcherUpdate,
      error: {},
    },
    on: {
      ERROR: {
        target: "error",
        actions: "setError",
      },
    },
    invoke: {
      id: "error",
      src: () =>
        invokeIpcEvent<MachineEvent>("go to error page", (error, data) => ({
          type: "ERROR",
          error,
          data,
        })),
    },
  },
  {
    actions: {
      resetProgress: assign<MachineContext, MachineEvent>({ progress: 0 }),
      updateProgress: assign<MachineContext, MachineEvent>({
        progress: (context, event) =>
          event.type === "UPDATE_PROGRESS" ? event.progress : context.progress,
      }),
      setError: assign((context, event) => ({
        error: event.type === "ERROR" ? event.error : context.error,
        data: event.type === "ERROR" ? event.data : context.data,
      })),
    },
  }
);

export const updateService = interpret(updateMachine, {
  devTools: process.env.NODE_ENV !== "production",
}).start();
