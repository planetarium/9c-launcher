import React, { useEffect } from "react";
import { ipcRenderer, remote } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import { BLOCKCHAIN_STORE_PATH } from "../../../config";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";

const transifexTags = "errorNoPermission";

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
        <T _str="No permission." _tags={transifexTags} />
      </Typography>
      <Typography variant="subtitle1">
        <T
          _str="Application does not have permission at below path:"
          _tags={transifexTags}
        />
        <br />
        <code className={classes.code}>{BLOCKCHAIN_STORE_PATH}</code>
        <br />
        <T
          _str="Please change chain directory by following steps below."
          _tags={transifexTags}
        />
      </Typography>
      <ol>
        <li>
          <T
            _str="Open SETTINGS page by clicking the button at the right side."
            _tags={transifexTags}
          />
        </li>
        <li>
          <T
            _str='Change \"Root chain store path\" by click \"SELECT PATH\" Button'
            _tags={transifexTags}
          />
        </li>
      </ol>
    </div>
  );
};

export default ErrorNoPermissionView;
