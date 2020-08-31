import * as React from "react";
import { remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";
import { BLOCKCHAIN_STORE_PATH } from "../../../config";

const ErrorNoPermissionView: React.FC<{}> = () => {
  const classes = errorViewStyle();

  React.useEffect(() => {
    mixpanel.track("Launcher/ErrorNoPerm");
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        No permission.
      </Typography>
      <Typography variant="subtitle1">
        Application does not have permission for:
        <br />
        <code className={classes.code}>{BLOCKCHAIN_STORE_PATH}</code>
        <br />
        Please change chain directory by following steps below.
      </Typography>
      <ol>
        <li>Open SETTINGS page by clicking the button at the right side.</li>
        <li>
          Modify "Root chain store path" and "Chain store directory name" then
          click OK.
        </li>
        <li>Restart launcher.</li>
      </ol>
    </Container>
  );
};

export default ErrorNoPermissionView;
