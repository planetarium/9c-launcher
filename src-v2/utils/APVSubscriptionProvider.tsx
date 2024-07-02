import React from "react";
import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { ipcRenderer } from "electron";
import { IDownloadProgress } from "src/interfaces/ipc";
import UpdateView from "src/renderer/views/UpdateView";
import { updateMachine } from "src/renderer/machines/updateMachine";

export default function APVSubscriptionProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [state, send] = useMachine(updateMachine, { devTools: true });

  useEffect(() => {
    // Progress updates
    ipcRenderer.on(
      "update extract progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      },
    );
    ipcRenderer.on(
      "update download progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      },
    );
    ipcRenderer.on(
      "update player extract progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      },
    );
    ipcRenderer.on(
      "update player download progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      },
    );
  }, []);

  return state.matches("ok") || state.matches("error") ? (
    <>{children}</>
  ) : (
    <UpdateView state={state} progress={state.context.progress} />
  );
}
