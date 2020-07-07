import * as React from "react";

import { ipcRenderer, IpcRendererEvent } from "electron";
import { Button } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

interface IDownloadSnaphostProps {
  disabled: boolean;
  setExtractState: React.Dispatch<React.SetStateAction<boolean>>;
  setDownloadState: React.Dispatch<React.SetStateAction<boolean>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  className: string;
}

const DownloadSnapshotButton = (props: IDownloadSnaphostProps) => {
  React.useEffect(() => {
    ipcRenderer.on("extract progress", (event, progress) => {
      props.setExtractState(true);
      props.setProgress(progress * 100);
    });

    ipcRenderer.on("extract complete", (event) => {
      props.setExtractState(false);
    });

    ipcRenderer.on(
      "download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        props.setDownloadState(true);
        props.setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("download complete", (_, path: string) => {
      props.setDownloadState(false);
    });
  }, []);
  const downloadSnapShot = () => {
    const options: IDownloadOptions = {
      properties: {},
    };
    ipcRenderer.send("download snapshot", options);
  };
  return (
    <Button
      startIcon={<CloudDownloadIcon />}
      disabled={props.disabled}
      onClick={(event: React.MouseEvent) => {
        downloadSnapShot();
      }}
      color="default"
      className={props.className}
    >
      Download Snapshot
    </Button>
  );
};

export default DownloadSnapshotButton;
