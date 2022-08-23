import { ipcRenderer } from "electron";
import { assign, createMachine } from "xstate";
import { invokeIpcEvent } from "../utils/ipcEvent";

type MachineEvent =
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "PLAYER_DOWNLOAD" }
  | { type: "LAUNCHER_DOWNLOAD" }
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
        UPDATE_PROGRESS: { actions: "updateProgress" },
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
  on: {
    DONE: { target: "ok" },
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
        src: () =>
          invokeIpcEvent<MachineEvent>("update extract complete", "COPY"),
      },
    },
    copy: {
      entry: "resetProgress",
      invoke: {
        src: () => invokeIpcEvent<MachineEvent>("update copy complete", "DONE"),
      },
    },
  },
  on: {
    DONE: { target: "ok" },
  },
};

export default createMachine<MachineContext, MachineEvent, UpdateMachineState>(
  {
    id: "(machine)",
    initial: "ok",
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
    },
  },
  {
    actions: {
      resetProgress: assign<MachineContext, MachineEvent>({ progress: 0 }),
      updateProgress: assign<MachineContext, MachineEvent>({
        progress: (context, event) =>
          event.type === "UPDATE_PROGRESS" ? event.progress : context.progress,
      }),
    },
  }
);
