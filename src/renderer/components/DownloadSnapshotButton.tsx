import * as React from "react";
import { useState } from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Button, CircularProgress } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

interface IDownloadSnaphostProps {
  className: string;
  setSnapshotProgressState: React.Dispatch<React.SetStateAction<boolean>>;
}

const DownloadSnapshotButton = (props: IDownloadSnaphostProps) => {
  const [isExtract, setExtractState] = useState(false);
  const [isDownload, setDownloadState] = useState(false);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    ipcRenderer.on("extract progress", (event, progress) => {
      setExtractState(true);
      setProgress(progress * 100);
    });

    ipcRenderer.on("extract complete", (event) => {
      setExtractState(false);
    });

    ipcRenderer.on(
      "download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setDownloadState(true);
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("download complete", (_, path: string) => {
      setDownloadState(false);
    });
  }, []);

  React.useEffect(() => {
    props.setSnapshotProgressState(isExtract || isDownload);
  }, [isExtract, isDownload]);
  const downloadSnapShot = () => {
    const options: IDownloadOptions = {
      properties: {},
    };
    ipcRenderer.send("download snapshot", options);
  };
  return (
    <Button
      startIcon={<CloudDownloadIcon />}
      disabled={isDownload || isExtract}
      onClick={(event: React.MouseEvent) => {
        downloadSnapShot();
      }}
      variant="text"
      className={props.className}
    >
      {isDownload || isExtract ? (
        <>
          {isDownload ? "Downloading..." : "Extracting..."}
          <CircularProgress variant="static" size={15} value={progress} />
        </>
      ) : (
        <>Download Snapshot</>
      )}
    </Button>
  );
};

export default DownloadSnapshotButton;
