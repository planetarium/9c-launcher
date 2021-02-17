import React, { useCallback, useEffect } from "react";
import { ipcRenderer, remote } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";

import { useLocale } from "../../i18n";
import { ErrorRelaunch } from "../../../interfaces/i18n";

const ErrorRelaunchView = () => {
  const classes = errorViewStyle();

  const { locale } = useLocale<ErrorRelaunch>("errorRelaunch");

  const steps = locale("steps");
  if (typeof steps === "string")
    throw Error("errorRelaunch.steps is not array in src/i18n/index.json");

  const handleRelaunch = useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorRelaunch");
    Sentry.captureException(new Error("Relaunch required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("무언가 잘못 되었습니다.")}
      </Typography>
      <Typography variant="subtitle1">
        {locale("아래 절차를 따라 해주세요.")}
      </Typography>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRelaunch}
      >
        {locale("Relaunch")}
      </Button>
    </div>
  );
};

export default ErrorRelaunchView;
