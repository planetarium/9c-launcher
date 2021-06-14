import React, { useCallback, useEffect } from "react";
import { remote, ipcRenderer } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";

import { T } from "@transifex/react";

const ErrorClearCacheView = () => {
  const classes = errorViewStyle();

  const handleClearCache = useCallback(() => {
    ipcRenderer.sendSync("clear cache", false);
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorClearCache");
    Sentry.captureException(new Error("Clear cache required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T _str="Something went wrong." _tags="errorClearCache" />
      </Typography>
      <Typography variant="subtitle1">
        <T
          _str="Please press the button below to clear cache. The launcher will restart automatically."
          _tags="errorClearCache" />
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleClearCache}
      >
        <T _str="Clear cache" _tags="errorClearCache" />
      </Button>
    </div>
  );
};

export default ErrorClearCacheView;
