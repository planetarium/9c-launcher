import { assign, createMachine } from "@xstate/fsm";

type MachineEvent =
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "DOWNLOAD" }
  | { type: "EXTRACT" }
  | { type: "COPY" }
  | { type: "DONE" };

interface MachineContext {
  progress: number;
}

interface MachineState {
  value: "ok" | "download" | "extract" | "copy";
  context: MachineContext;
}

export const machine = createMachine<
  MachineContext,
  MachineEvent,
  MachineState
>(
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
      },
      download: {
        entry: "resetProgress",
        on: {
          EXTRACT: { target: "extract" },
          UPDATE_PROGRESS: { actions: "updateProgress" },
        },
      },
      extract: {
        entry: "resetProgress",
        on: {
          COPY: { target: "copy" },
          UPDATE_PROGRESS: { actions: "updateProgress" },
        },
      },
      copy: {
        entry: "resetProgress",
        on: {
          DONE: { target: "ok" },
        },
      },
    },
  },
  {
    actions: {
      resetProgress: assign({ progress: 0 }),
      updateProgress: assign({
        progress: (context, event) =>
          event.type === "UPDATE_PROGRESS" ? event.progress : context.progress,
      }),
    },
  }
);
