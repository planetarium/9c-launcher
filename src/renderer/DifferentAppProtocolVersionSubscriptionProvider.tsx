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
  // FIXME: DownloadSnapshotButton과 중복되는 로직을 줄일 수 있을까
  const [isDownload, setDownloadState] = useState(false);
  const [isExtract, setExtractState] = useState(false);
  const [isCopying, setCopyingState] = useState(false);
  const [variant, setVariant] = useState<
    "indeterminate" | "determinate" | undefined
  >("determinate");
  // FIXME: file lock이 제대로 걸려있지 않아서 파일을 여러 번 받아서 프로그레스가 뒤로 가는 경우가 있습니다.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    ipcRenderer.on("update extract progress", (event, progress) => {
      setExtractState(true);
      setVariant("determinate");
      setProgress(progress * 100);
    });

    ipcRenderer.on("update extract complete", (event) => {
      setExtractState(false);
    });

    ipcRenderer.on(
      "update download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setDownloadState(true);
        setVariant("determinate");
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("update download complete", () => {
      setDownloadState(false);
    });

    // TODO: copying progress를 받아야 합니다.
    ipcRenderer.on("update copying progress", () => {
      setCopyingState(true);
      setVariant("indeterminate");
    });

    ipcRenderer.on("update copying complete", () => {
      setCopyingState(false);
    });

    //@ts-ignore
    // Force-update function for developers (debug purpose)
    window.updateLauncher = (url) => {
      const extra: string = encode({
        WindowsBinaryUrl: url,
      }).toString("hex");
      const differentAppProtocolVersionEncounter: DifferentAppProtocolVersionEncounterSubscription = {
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
      );
    };
  }, []);

  // FIXME: 구독 로직과 아예 분리할 수 있다면 좋을텐데.
  const {
    loading,
    data,
  } = useDifferentAppProtocolVersionEncounterSubscription();
  useEffect(() => {
    if (
      !loading &&
      null !== data?.differentAppProtocolVersionEncounter &&
      undefined !== data?.differentAppProtocolVersionEncounter
    ) {
      ipcRenderer.send("encounter different version", data);
    }
  }, [loading, data]);

  return isDownload || isExtract || isCopying
    ? (<UpdateView
      state={isDownload ? "download" : isExtract ? "extract" : "copy"}
      variant={variant}
      progress={progress} />)
    : (<>{children}</>);
};
