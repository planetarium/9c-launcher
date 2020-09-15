import React, { useCallback, useEffect } from "react";
import { shell, remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";
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
    <Container className={classes.root}>
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
      <Typography>
        {`${locale(
          "혹시 이 페이지를 재설치 후에 여전히 보셨다면, 다음을 통해 지원을 받으세요."
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
    </Container>
  );
};

export default ErrorReinstallView;
