import React, { useEffect } from "react";
import errorViewStyle from "./ErrorView.style";
import { Typography } from "@material-ui/core";
import prettyBytes from "pretty-bytes";
import { BLOCKCHAIN_STORE_PATH, REQUIRED_DISK_SPACE } from "../../../config";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";
import { ipcRenderer } from "electron";

const transifexTags = "errorDiskSpace";

const ErrorDiskSpaceView = () => {
  const classes = errorViewStyle();

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorDiskSpace");
    Sentry.captureException(new Error("Disk space is not enough."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T _str="Disk space is not enough." _tags={transifexTags} />
      </Typography>
      <Typography>
        <T
          _str="Required free space: {space}"
          _tags={transifexTags}
          space={prettyBytes(REQUIRED_DISK_SPACE)}
        />
      </Typography>
      <Typography>
        <T
          _str="Root chain store path: {path}"
          _tags={transifexTags}
          path={BLOCKCHAIN_STORE_PATH}
        />
      </Typography>
    </div>
  );
};

export default ErrorDiskSpaceView;
