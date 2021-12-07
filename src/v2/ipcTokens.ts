export const IPC_SNAPSHOT_PROGRESS = "v2/snapshotProgress" as const;
export const IPC_PRELOAD_NEXT = "v2/preloadNext" as const;
export const IPC_PRELOAD_IDLE = "v2/preloadIdle" as const;

interface ArgumentMappings {
  [IPC_SNAPSHOT_PROGRESS]: [number];
  [IPC_PRELOAD_NEXT]: [];
  [IPC_PRELOAD_IDLE]: [];
}

export type ArgumentOf<T extends keyof ArgumentMappings> = ArgumentMappings[T];
export type EventName = keyof ArgumentMappings;
