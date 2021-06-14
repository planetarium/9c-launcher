import React, { useCallback, useEffect } from "react";
import { shell, remote, ipcRenderer } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";
import { ErrorReinstall } from "../../../interfaces/i18n";

const ErrorReinstallView = () => {
  const classes = errorViewStyle();

  const handleExit = useCallback(() => {
    if (
      window.confirm(
        "This will close launcher. Are you sure you want to clear cache and restart?"
      )
    ) {
      ipcRenderer.sendSync("clear cache", false);
      remote.app.relaunch();
      remote.app.exit();
    }
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorReinstall");
    Sentry.captureException(new Error("Reinstall required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T
          _str="Press the button below to clear the cache."
          _tags="errorReinstall"
        />
      </Typography>
      <Typography>
        <T
          _str="If you are still seeing this page after clearing cache, please try to reinstall the app through the link below or get support via Discord."
          _tags="errorReinstall"
        />{" "}
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal(
              "https://download.nine-chronicles.com/NineChroniclesInstaller.exe"
            );
          }}
        >
          <T _str="Install Link" _tags="errorReinstall" />
        </a>
        .
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleExit}
      >
        <T _str="Clear Cache & Restart" _tags="errorReinstall" />
      </Button>
    </div>
  );
};

export default ErrorReinstallView;
