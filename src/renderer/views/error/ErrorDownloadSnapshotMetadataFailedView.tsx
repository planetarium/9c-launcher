import { Button, Typography } from "@material-ui/core";
import { ipcRenderer, remote } from "electron";
import React, { useCallback, useEffect } from "react";
import { T } from "@transifex/react";
import errorViewStyle from "./ErrorView.style";

const ErrorDownloadSnapshotMetadataFailedView = () => {
  const classes = errorViewStyle();

  const handleRestart = useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorDownloadSnapshotMetadata");
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T
          _str="Failed to download Snapshot metadata."
          _tags="errorDownloadSnapshotMetadataFailed" />
      </Typography>
      <Typography variant="subtitle1">
        <T
          _str="Unable to connect. Please check your network connection."
          _tags="errorDownloadSnapshotMetadataFailed" />
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRestart}
      >
        <T _str="Restart" _tags="errorDownloadSnapshotMetadataFailed" />
      </Button>
    </div>
  );
};

export default ErrorDownloadSnapshotMetadataFailedView;
