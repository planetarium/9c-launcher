import React, { useEffect } from "react";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Typography } from "@material-ui/core";
import prettyBytes from "pretty-bytes";
import { BLOCKCHAIN_STORE_PATH, REQUIRED_DISK_SPACE } from "../../../config";
import * as Sentry from "@sentry/electron";

const ErrorDiskSpaceView = () => {
  const classes = errorViewStyle();

  useEffect(() => {
    mixpanel.track("Launcher/ErrorDiskSpace");
    Sentry.captureException(new Error("Disk space is not enough."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        Disk space is not enough.
      </Typography>
      <Typography>
        Please try again after free at least {prettyBytes(REQUIRED_DISK_SPACE)}.
        Chain Path: {BLOCKCHAIN_STORE_PATH}
      </Typography>
    </div>
  );
};

export default ErrorDiskSpaceView;
