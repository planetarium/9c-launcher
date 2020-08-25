import * as React from "react";
import { remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";

const ErrorRelaunchView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  const handleRelaunch = React.useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  React.useEffect(() => {
    mixpanel.track("Launcher/ErrorRelaunch");
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        Something went wrong.
      </Typography>
      <Typography variant="subtitle1">Please follow step below.</Typography>
      <ol>
        <li>Relaunch &ldquo;Nine Chornicles&rdquo;</li>
        <li>Login once again</li>
      </ol>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRelaunch}
      >
        Relaunch
      </Button>
    </Container>
  );
};

export default ErrorRelaunchView;
