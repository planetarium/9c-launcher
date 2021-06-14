import { Button, Typography } from "@material-ui/core";
import { ipcRenderer, remote } from "electron";
import React, { useCallback, useEffect } from "react";
import { T } from "@transifex/react";
import errorViewStyle from "./ErrorView.style";

const ErrorDownloadBinaryFailedView = () => {
  const classes = errorViewStyle();

  const handleRestart = useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorDownloadBinary");
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T _str="Failed to download binary." _tags="errorDownloadBinaryFailed" />
      </Typography>
      <Typography variant="subtitle1">
        <T
          _str="Unable to connect. Please check your network connection."
          _tags="errorDownloadBinaryFailed" />
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRestart}
      >
        <T _str="Restart" _tags="errorDownloadBinaryFailed" />
      </Button>
    </div>
  );
};

export default ErrorDownloadBinaryFailedView;
