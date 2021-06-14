import React, { useEffect } from "react";
import { ipcRenderer, remote } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import { BLOCKCHAIN_STORE_PATH } from "../../../config";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";

const ErrorNoPermissionView = () => {
  const classes = errorViewStyle();

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorNoPerm");
    Sentry.captureException(
      new Error("Error occurred while creating directory.")
    );
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T _str="No permission." _tags="errorNoPermission" />
      </Typography>
      <Typography variant="subtitle1">
        <T
          _str="Application does not have permission at below path:"
          _tags="errorNoPermission"
        />
        <br />
        <code className={classes.code}>{BLOCKCHAIN_STORE_PATH}</code>
        <br />
        <T
          _str="Please change chain directory by following steps below."
          _tags="errorNoPermission"
        />
      </Typography>
      <ol>
        <li>
          <T
            _str="Open SETTINGS page by clicking the button at the right side."
            _tags="errorNoPermission"
          />
        </li>
        <li>
          <T
            _str='Change \"Root chain store path\" by click \"SELECT PATH\" Button'
            _tags="errorNoPermission"
          />
        </li>
      </ol>
    </div>
  );
};

export default ErrorNoPermissionView;
