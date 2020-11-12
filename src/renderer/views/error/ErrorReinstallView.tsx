import React, { useCallback, useEffect } from "react";
import { shell, remote, ipcRenderer } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";
import { useLocale } from "../../i18n";
import { ErrorReinstall } from "../../../interfaces/i18n";

const ErrorReinstallView = () => {
  const classes = errorViewStyle();
  const { locale } = useLocale<ErrorReinstall>("errorReinstall");

  const steps = locale("steps");

  if (typeof steps === "string")
    throw Error("errorReinstall.steps is not array in src/i18n/index.json");

  const handleExit = useCallback(() => {
    if (
      window.confirm("This will close launcher. Are you sure to clear cache?")
    ) {
      ipcRenderer.sendSync("clear cache");
    }
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    mixpanel.track("Launcher/ErrorReinstall");
    Sentry.captureException(new Error("Reinstall required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {"Press the button below to clear the cache"}
      </Typography>
      {/* <Typography variant="subtitle1">
        {locale("아래 절차를 따라 해주세요.")}
      </Typography>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol> */}
      <Typography>
        {`${"If you are still seeing this page after clearing cache, please try to reinstall the app through the link below or get support via Discord."} `}
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal(
              "https://download.nine-chronicles.com/NineChroniclesInstaller.exe"
            );
          }}
        >
          {"Install Link"}
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
        {"Clear Cache & Restart"}
      </Button>
    </div>
  );
};

export default ErrorReinstallView;
