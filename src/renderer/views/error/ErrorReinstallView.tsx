import * as React from "react";
import { shell, remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";

import { useLocale } from "../../i18n";

const ErrorReinstallView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  const locale = useLocale("errorReinstall");

  const steps = locale("steps");

  if (typeof steps === "string")
    throw Error("errorReinstall.steps is not array in src/i18n/index.json");

  const handleExit = React.useCallback(() => {
    remote.app.exit();
  }, []);

  React.useEffect(() => {
    mixpanel.track("Launcher/ErrorReinstall");
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("title")}
      </Typography>
      <Typography variant="subtitle1">{locale("subtitle")}</Typography>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Typography>
        If you met this page again after reinstall, please contact us via&nbsp;
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal("https://forum.nine-chronicles.com");
          }}
        >
          {locale("discord")}
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
        {locale("close")}
      </Button>
    </Container>
  );
};

export default ErrorReinstallView;
