import { IDownloadProgress } from "src/interfaces/ipc";
import { assign, createMachine, interpret } from "xstate";
import { IPC_PRELOAD_NEXT, IPC_SNAPSHOT_PROGRESS } from "../ipcTokens";
import { invokeIpcEvent } from "../utils/ipcEvent";
import { inspect } from "@xstate/inspect";

inspect({ iframe: false, url: "https://stately.ai/viz?inspect" });

type PreloadMachineContext = {
  progress?: number;
  /**
   * The current step of the preload machine.
   * Used as an UI representation of current preload progress.
   *
   * If this field is not present, the meta field of the state should be used.
   */
  step?: number;
};

type PreloadMachineEvent =
  | { type: "BOOTSTRAP" }
  | { type: "NEXT" }
  | { type: "SKIP_UPDATE" }
  | { type: "PROGRESS"; progress: number }
  | { type: "HEADLESS" }
  | { type: "DONE" }
  | { type: "ERROR"; error: string };

type PreloadMachineTypestates =
  | { value: "idle"; context: {} }
  | { value: "snapshot"; context: Pick<PreloadMachineContext, "progress"> }
  | { value: "headless"; context: PreloadMachineContext }
  | { value: "done"; context: {} };

export const preloadMachine = createMachine<
  PreloadMachineContext,
  PreloadMachineEvent,
  PreloadMachineTypestates
>(
  {
    initial: "idle",
    context: {
      progress: 0,
    },
    states: {
      idle: {
        on: {
          BOOTSTRAP: "snapshot",
        },
        meta: {
          step: 0,
        },
        invoke: {
          id: "bootstrap",
          src: () =>
            invokeIpcEvent<PreloadMachineEvent>("start bootstrap", "BOOTSTRAP"),
        },
      },
      snapshot: {
        initial: "checkUpdates",
        states: {
          checkUpdates: {
            entry: "resetProgress",
            on: {
              NEXT: "download",
              SKIP_UPDATE: "startingHeadless",
            },
            meta: {
              step: 1,
            },
          },
          download: {
            entry: "resetProgress",
            on: {
              NEXT: "downloadState",
            },
            meta: {
              step: 2,
            },
          },
          downloadState: {
            entry: "resetProgress",
            on: {
              NEXT: "extract",
            },
            meta: {
              step: 3,
            },
          },
          extract: {
            entry: "resetProgress",
            on: {
              NEXT: "startingHeadless",
            },
            meta: {
              step: 4,
            },
          },
          startingHeadless: {
            entry: "resetProgress",
            meta: {
              step: 5,
            },
          },
        },
        on: {
          HEADLESS: {
            target: "headless",
            actions: ["setHeadlessContext"],
          },
          PROGRESS: {
            actions: ["setProgress"],
          },
        },
        invoke: [
          {
            id: "progress",
            src: () =>
              invokeIpcEvent<PreloadMachineEvent, typeof IPC_SNAPSHOT_PROGRESS>(
                IPC_SNAPSHOT_PROGRESS,
                (progress) => ({
                  type: "PROGRESS",
                  progress: progress * 100,
                })
              ),
          },
          {
            id: "next",
            src: () =>
              invokeIpcEvent<PreloadMachineEvent>(IPC_PRELOAD_NEXT, "NEXT"),
          },
          {
            id: "headless",
            src: () =>
              invokeIpcEvent<PreloadMachineEvent>("start headless", "HEADLESS"),
          },
        ],
      },
      headless: {
        entry: "resetProgress",
        on: {
          DONE: "done",
          PROGRESS: {
            actions: ["setProgress"],
          },
        },
      },
      done: {},
      error: {},
    },
    on: {
      ERROR: "error",
    },
  },
  {
    actions: {
      resetProgress: assign<PreloadMachineContext, PreloadMachineEvent>({
        progress: undefined,
      }),
      setProgress: assign((context, event) => ({
        progress: event.type === "PROGRESS" ? event.progress : context.progress,
      })),
    },
  }
);

export const preloadService = interpret(preloadMachine, {
  devTools: true,
}).start();
