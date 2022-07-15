import React, { useCallback, useEffect } from "react";
import { shell, ipcRenderer } from "electron";
import * as remote from "@electron/remote";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";

const transifexTags = "errorReinstall";

const ErrorReinstallView = () => {
  const classes = errorViewStyle();

  const handleExit = useCallback(async () => {
    if (
      window.confirm(
        "This will close launcher. Are you sure you want to clear cache and restart?"
      )
    ) {
      await ipcRenderer.sendSync("clear cache", false);
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
          _tags={transifexTags}
        />
      </Typography>
      <Typography>
        <T
          _str="If you are still seeing this page after clearing cache, please try to reinstall the app through the link below or get support via Discord."
          _tags={transifexTags}
        />{" "}
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal(
              "https://download.nine-chronicles.com/NineChroniclesInstaller.exe"
            );
          }}
        >
          <T _str="Install Link" _tags={transifexTags} />
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
        <T _str="Clear Cache & Restart" _tags={transifexTags} />
      </Button>
    </div>
  );
};

export default ErrorReinstallView;
