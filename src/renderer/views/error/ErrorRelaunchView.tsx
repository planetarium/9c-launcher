import React, { useCallback, useEffect } from "react";
import { ipcRenderer, remote } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";

import { T, useT } from "@transifex/react";

const transifexTags = "errorRelaunch";

const ErrorRelaunchView = () => {
  const classes = errorViewStyle();

  const steps = useT("Relaunch “Nine Chronicles”\n" + "Login once again", { _tags: "errorRelaunch" });

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
        <T _str="Something went wrong." _tags={transifexTags}/>
      </Typography>
      <Typography variant="subtitle1">
        <T _str="Please follow the steps below." _tags={transifexTags}/>
      </Typography>
      <ol>
        {steps.split('\n').map((step: string) => (
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
        <T _str="Relaunch" _tags={transifexTags}/>
      </Button>
    </div>
  );
};

export default ErrorRelaunchView;
