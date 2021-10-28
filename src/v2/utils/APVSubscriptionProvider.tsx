import React from "react";
import { useMachine } from "@xstate/react";
import { useDifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";
import { useEffect } from "react";
import { ipcRenderer } from "electron";
import { IDownloadProgress } from "src/interfaces/ipc";
import UpdateView from "../components/UpdateView";
import machine from "../machines/updateMachine";

export default function APVSubscriptionProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [state, send] = useMachine(machine);
  state.value;
  const { loading, data } =
    useDifferentAppProtocolVersionEncounterSubscription();

  useEffect(() => {
    if (loading) return;
    if (data?.differentAppProtocolVersionEncounter) {
      ipcRenderer.send("encounter different version", data);
      send("DOWNLOAD");
    }
  }, [data, loading]);

  useEffect(() => {
    // Progress updates
    ipcRenderer.on(
      "update extract progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      }
    );
    ipcRenderer.on(
      "update download progress",
      (_event, progress: IDownloadProgress) => {
        send({ type: "UPDATE_PROGRESS", progress: progress.percent * 100 });
      }
    );

    // State transitions
    ipcRenderer.on("update download complete", () => send("EXTRACT"));
    ipcRenderer.on("update extract complete", () => send("COPY"));
    ipcRenderer.on("update copying complete", () => send("DONE"));
  }, []);

  return state.matches("ok") ? (
    <>{children}</>
  ) : (
    <UpdateView state={state} progress={state.context.progress} />
  );
}
