import React, { useCallback, useEffect } from "react";
import { shell, remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";

import { useLocale } from "../../i18n";

const ErrorReinstallView = () => {
  const classes = errorViewStyle();
  const { locale } = useLocale("errorReinstall");

  const steps = locale("steps");

  if (typeof steps === "string")
    throw Error("errorReinstall.steps is not array in src/i18n/index.json");

  const handleExit = useCallback(() => {
    remote.app.exit();
  }, []);

  useEffect(() => {
    mixpanel.track("Launcher/ErrorReinstall");
    Sentry.captureException(new Error("Reinstall required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("Something went wrong.")}
      </Typography>
      <Typography variant="subtitle1">
        {locale("Please follow the steps below.")}
      </Typography>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Typography>
        {`${locale(
          "If you are still seeing this page after reinstall, please contact support via"
        )} `}
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal("https://forum.nine-chronicles.com");
          }}
        >
          {locale("Discord")}
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
        {locale("Close")}
      </Button>
    </div>
  );
};

export default ErrorReinstallView;
