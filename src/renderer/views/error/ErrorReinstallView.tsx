import React, { useCallback, useEffect } from "react";
import { shell, remote, ipcRenderer } from "electron";
import mixpanel from "mixpanel-browser";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/electron";
import { useLocale } from "../../i18n";
import { ErrorReinstall } from "../../../interfaces/i18n";

const ErrorReinstallView = () => {
  const classes = errorViewStyle();
  const { locale } = useLocale<ErrorReinstall>("errorReinstall");

  const handleExit = useCallback(() => {
    if (
      window.confirm("This will close launcher. Are you sure to clear cache?")
    ) {
      ipcRenderer.sendSync("clear cache");
      remote.app.relaunch();
      remote.app.exit();
    }
  }, []);

  useEffect(() => {
    mixpanel.track("Launcher/ErrorReinstall");
    Sentry.captureException(new Error("Reinstall required."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("클리어 캐시 버튼을 눌러 주십시오.")}
      </Typography>
      <Typography>
        {`${locale(
          "혹시 이 페이지를 클리어 캐시 후에 여전히 보셨다면, 아래 링크로 앱을 재설치 하거나 디스코드에서 지원 요청해주시길 바랍니다."
        )} `}
        <a
          className={classes.link}
          onClick={() => {
            shell.openExternal(
              "https://download.nine-chronicles.com/NineChroniclesInstaller.exe"
            );
          }}
        >
          {locale("Install Link")}
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
        {locale("캐시 클리어 & 재시작")}
      </Button>
    </div>
  );
};

export default ErrorReinstallView;
