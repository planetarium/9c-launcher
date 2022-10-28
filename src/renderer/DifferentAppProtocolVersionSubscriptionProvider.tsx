import { encode } from "bencodex";
import React, { useState, useEffect } from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  DifferentAppProtocolVersionEncounterSubscription,
  useDifferentAppProtocolVersionEncounterSubscription,
} from "../generated/graphql";
import { IDownloadProgress } from "../interfaces/ipc";
import UpdateView from "./views/update/UpdateView";

export const DifferentAppProtocolVersionSubscriptionProvider: React.FC = ({
  children,
}) => {
  // FIXME: Can we minimize duplicated logic with DownloadSnapshotButton?
  const [isPlayerUpdate, setPlayerUpdateState] = useState(false);
  const [isDownload, setDownloadState] = useState(false);
  const [isExtract, setExtractState] = useState(false);
  const [isCopying, setCopyingState] = useState(false);
  const [variant, setVariant] = useState<
    "indeterminate" | "determinate" | undefined
  >("determinate");
  // FIXME: Some files were downloaded multiple times because of improper file lock, causing progress to go backward.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on("update extract progress", (event) => {
      setExtractState(true);
      setVariant("indeterminate");
    });

    ipcRenderer.on("update extract complete", (event) => {
      setExtractState(false);
    });

    ipcRenderer.on(
      "update download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setPlayerUpdateState(false);
        setDownloadState(true);
        setVariant("determinate");
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("update download complete", () => {
      setDownloadState(false);
    });

    // TODO: we should get copying progress.
    ipcRenderer.on("update copying progress", () => {
      setCopyingState(true);
      setVariant("indeterminate");
    });

    ipcRenderer.on("update copying complete", () => {
      setCopyingState(false);
    });

    ipcRenderer.on(
      "update player download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setPlayerUpdateState(true);
        setDownloadState(true);
        setVariant("determinate");
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("update player download complete", () => {
      setDownloadState(false);
    });

    ipcRenderer.on("update player extract progress", (event) => {
      setExtractState(true);
      setVariant("indeterminate");
    });

    ipcRenderer.on("update player extract complete", () => {
      setExtractState(false);
    });

    // @ts-expect-error -- Force-update function for developers (debug purpose)
    window.updateLauncher = (url) => {
      const extra: string = encode({
        WindowsBinaryUrl: url,
      }).toString("hex");
      const differentAppProtocolVersionEncounter: DifferentAppProtocolVersionEncounterSubscription =
        {
          differentAppProtocolVersionEncounter: {
            peer: "",
            localVersion: {
              version: 10000,
              extra,
            },
            peerVersion: {
              version: 1000008,
              extra,
            },
          },
        };
      ipcRenderer.send(
        "encounter different version",
        differentAppProtocolVersionEncounter
          .differentAppProtocolVersionEncounter.peerVersion
      );
    };
  }, []);

  // FIXME: It would be nice to seperate from subscription logic completely.
  const { loading, data } =
    useDifferentAppProtocolVersionEncounterSubscription();
  useEffect(() => {
    if (
      !loading &&
      null !== data?.differentAppProtocolVersionEncounter &&
      undefined !== data?.differentAppProtocolVersionEncounter
    ) {
      ipcRenderer.send(
        "encounter different version",
        data.differentAppProtocolVersionEncounter.peerVersion
      );
    }
  }, [loading, data]);

  return isDownload || isExtract || isCopying ? (
    <UpdateView
      updateTarget={isPlayerUpdate ? "player" : "launcher"}
      state={isDownload ? "download" : isExtract ? "extract" : "copy"}
      variant={variant}
      progress={progress}
    />
  ) : (
    <>{children}</>
  );
};
