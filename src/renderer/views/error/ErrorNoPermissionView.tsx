import * as React from "react";
import { remote } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";
import { BLOCKCHAIN_STORE_PATH } from "../../../config";

const ErrorNoPermissionView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  const handleRelaunch = React.useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  React.useEffect(() => {
    mixpanel.track("Launcher/ErrorNoPerm");
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        No permission.
      </Typography>
      <Typography variant="subtitle1">
        Application does not have permission for: {BLOCKCHAIN_STORE_PATH}.
        Please change chain directory by following steps below.
      </Typography>
      <ol>
        <li>
          Open config.json file using your text editor. (e.g. Notepad, TextEdit)
          The file is located at:
          <br />"
          {process.platform === "darwin"
            ? `${remote.app.getAppPath()}/Contents/Resources/app/config.json`
            : `${remote.app.getAppPath()}\\resources\\app\\config.json`}
          "
        </li>
        <li>
          Modify "BlockchainStoreDirParent" field. If the field does not exists,
          please create one.
        </li>
        <li>Restart launcher.</li>
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

export default ErrorNoPermissionView;
