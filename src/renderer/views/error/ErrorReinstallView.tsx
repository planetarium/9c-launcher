import * as React from "react";
import { shell, remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";

const ErrorReinstallView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  const handleExit = React.useCallback(() => {
    remote.app.exit();
  }, []);

  React.useEffect(() => {
    mixpanel.track("Launcher/ErrorReinstall");
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        Something went wrong.
      </Typography>
      <Typography variant="subtitle1">Please follow step below.</Typography>
      <ol>
        <li>Press close button</li>
        <li>Delete &ldquo;Nine Chornicles&rdquo;</li>
        <li>Install &ldquo;Nine Chornicles&rdquo;</li>
      </ol>
      <Typography>
        If you met this page again after reinstall, please contact us via&nbsp;
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal("https://forum.nine-chronicles.com");
          }}
        >
          Discord
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
        Close
      </Button>
    </Container>
  );
};

export default ErrorReinstallView;
