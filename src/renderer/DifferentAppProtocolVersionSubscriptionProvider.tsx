import * as React from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { useDifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";
import { useState } from "react";
import { CircularProgress, Container } from "@material-ui/core";

export const DifferentAppProtocolVersionSubscriptionProvider: React.FC = ({
  children,
}) => {
  // FIXME: DownloadSnapshotButton과 중복되는 로직을 줄일 수 있을까
  const [isExtract, setExtractState] = useState(false);
  const [isDownload, setDownloadState] = useState(false);
  const [isCopying, setCopyingState] = useState(false);
  const [variant, setVariant] = useState<
    "static" | "indeterminate" | "determinate" | undefined
  >("static");
  // FIXME: file lock이 제대로 걸려있지 않아서 파일을 여러 번 받아서 프로그레스가 뒤로 가는 경우가 있습니다.
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    ipcRenderer.on("update extract progress", (event, progress) => {
      setExtractState(true);
      setVariant("static");
      setProgress(progress * 100);
    });

    ipcRenderer.on("update extract complete", (event) => {
      setExtractState(false);
    });

    ipcRenderer.on(
      "update download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setDownloadState(true);
        setVariant("static");
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
  }, []);

  // FIXME: 구독 로직과 아예 분리할 수 있다면 좋을텐데.
  const {
    loading,
    data,
  } = useDifferentAppProtocolVersionEncounterSubscription();
  React.useEffect(() => {
    console.log(
      "differentAppProtocolVersionEncounterSubscription data: ",
      data
    );
    if (
      !loading &&
      null !== data?.differentAppProtocolVersionEncounter &&
      undefined !== data?.differentAppProtocolVersionEncounter
    ) {
      console.log("encounter different version");
      ipcRenderer.send("encounter different version", data);
    }
  }, [loading, data]);

  // FIXME: 업데이트 중 뜨는 화면을 별개의 뷰로 분리하면 좋을 것 같습니다.
  return isDownload || isExtract || isCopying ? (
    <Container
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      Now, update for new version client...
      <br />
      {isDownload
        ? "Downloading..."
        : isExtract
        ? "Extracting..."
        : "Copying..."}
      <br />
      <CircularProgress variant={variant} size={50} value={progress} />
    </Container>
  ) : (
    <>{children}</>
  );
};
