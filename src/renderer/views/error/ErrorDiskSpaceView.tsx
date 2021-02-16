import React, { useEffect } from "react";
import { mixpanelBrowser } from "../../../preload/mixpanel";
import errorViewStyle from "./ErrorView.style";
import { Typography } from "@material-ui/core";
import prettyBytes from "pretty-bytes";
import { BLOCKCHAIN_STORE_PATH, REQUIRED_DISK_SPACE } from "../../../config";
import * as Sentry from "@sentry/electron";
import { useLocale } from "../../i18n";
import { ErrorDiskSpace } from "../../../interfaces/i18n";

const ErrorDiskSpaceView = () => {
  const classes = errorViewStyle();

  const { locale } = useLocale<ErrorDiskSpace>("errorDiskSpace");

  useEffect(() => {
    mixpanelBrowser.track("Launcher/ErrorDiskSpace");
    Sentry.captureException(new Error("Disk space is not enough."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("디스크 공간이 충분하지 않습니다")}
      </Typography>
      <Typography>
        {locale("필요한 여유 공간:")} {prettyBytes(REQUIRED_DISK_SPACE)}
      </Typography>
      <Typography>
        {locale("체인 경로:")} {BLOCKCHAIN_STORE_PATH}
      </Typography>
    </div>
  );
};

export default ErrorDiskSpaceView;
