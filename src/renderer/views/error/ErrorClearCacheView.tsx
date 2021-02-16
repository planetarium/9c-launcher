import React, { useCallback, useEffect } from "react";
import { remote, ipcRenderer } from "electron";
import { mixpanelBrowser } from "../../../preload/mixpanel";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";

import { useLocale } from "../../i18n";
import { ErrorClearCache } from "../../../interfaces/i18n";

const ErrorClearCacheView = () => {
  const classes = errorViewStyle();

  const { locale } = useLocale<ErrorClearCache>("errorClearCache");

  const handleClearCache = useCallback(() => {
    ipcRenderer.sendSync("clear cache", false);
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    mixpanelBrowser.track("Launcher/ErrorClearCache");
    Sentry.captureException(new Error("Clear cache required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("실행 도중 오류가 발생했습니다.")}
      </Typography>
      <Typography variant="subtitle1">
        {locale(
          "아래 버튼을 눌러 캐시를 지워주세요. 론처가 자동으로 재시작됩니다."
        )}
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleClearCache}
      >
        {locale("ClearCache")}
      </Button>
    </div>
  );
};

export default ErrorClearCacheView;
