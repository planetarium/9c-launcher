import * as React from "react";
import { useState } from "react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Button, CircularProgress } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { useValidateSnapshotLazyQuery } from "../../generated/graphql";

interface IDownloadSnaphostProps {
  className: string;
  setSnapshotProgressState: React.Dispatch<React.SetStateAction<boolean>>;
}

const DownloadSnapshotButton = (props: IDownloadSnaphostProps) => {
  const [isExtract, setExtractState] = useState(false);
  const [isDownload, setDownloadState] = useState(false);
  const [progress, setProgress] = useState(0);

  const [
    validateSnapshot,
    { loading, data, error },
  ] = useValidateSnapshotLazyQuery();

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
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("metadata downloaded", (_, meta) => {
      validateSnapshot({ variables: { raw: meta } });
      // returns true iff snapshot need to be downloaded
    });

    ipcRenderer.on("download complete", (_, path: string) => {
      setDownloadState(false);
    });
  }, []);

  React.useEffect(() => {
    if (undefined === error && !loading && data?.validation.metadata) {
      const options: IDownloadOptions = {
        properties: {},
      };
      console.log("Snapshot is valid. Start downloading.");
      setDownloadState(true);
      ipcRenderer.send("download snapshot", options);
    }
  }, [data?.validation.metadata]);

  React.useEffect(() => {
    props.setSnapshotProgressState(isExtract || isDownload);
  }, [isExtract, isDownload]);

  const downloadSnapShot = () => {
    const options: IDownloadOptions = {
      properties: {},
    };
    ipcRenderer.send("download metadata", options);
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
