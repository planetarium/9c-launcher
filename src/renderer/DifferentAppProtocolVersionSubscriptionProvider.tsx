import { encode } from "bencodex";
import React, { useState, useEffect } from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import YouTube, { Options as IYoutubeOption } from "react-youtube";
import {
  DifferentAppProtocolVersionEncounterSubscription,
  useDifferentAppProtocolVersionEncounterSubscription,
} from "../generated/graphql";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { IDownloadProgress } from "../interfaces/ipc";

export const DifferentAppProtocolVersionSubscriptionProvider: React.FC = ({
  children,
}) => {
  // FIXME: DownloadSnapshotButton과 중복되는 로직을 줄일 수 있을까
  const [isExtract, setExtractState] = useState(false);
  const [isDownload, setDownloadState] = useState(false);
  const [isCopying, setCopyingState] = useState(false);
  const [variant, setVariant] = useState<
    "indeterminate" | "determinate" | undefined
  >("determinate");
  // FIXME: file lock이 제대로 걸려있지 않아서 파일을 여러 번 받아서 프로그레스가 뒤로 가는 경우가 있습니다.
  const [progress, setProgress] = useState(0);
  const videoOpts: IYoutubeOption = {
    width: "600",
    playerVars: {
      autoplay: 1,
    },
  };

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

  // FIXME: 업데이트 중 뜨는 화면을 별개의 뷰로 분리하면 좋을 것 같습니다.
  return isDownload || isExtract || isCopying ? (
    <Container
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <Box m="auto" width="80%">
        <YouTube videoId="Dfyugzqgd2M" opts={videoOpts} />
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress variant={variant} value={progress} />
          </Box>
          {variant === "determinate" && (
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">{`${Math.round(
                progress
              )}%`}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="caption">
          {isDownload
            ? "Downloading the new version..."
            : isExtract
            ? "Extracting the new version..."
            : "Copying files..."}
        </Typography>
      </Box>
    </Container>
  ) : (
    <>{children}</>
  );
};
