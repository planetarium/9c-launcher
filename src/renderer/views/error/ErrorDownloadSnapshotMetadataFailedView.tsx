import { Button, Typography } from "@material-ui/core";
import { ipcRenderer, remote } from "electron";
import React, { useCallback, useEffect } from "react";
import { ErrorDownloadSnapshotMetadataFailed } from "../../../interfaces/i18n";
import { useLocale } from "../../i18n";
import errorViewStyle from "./ErrorView.style";

const ErrorDownloadSnapshotMetadataFailedView = () => {
  const classes = errorViewStyle();
  const { locale } = useLocale<ErrorDownloadSnapshotMetadataFailed>("errorDownloadSnapshotMetadataFailed");

  const handleRestart = useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorDownloadSnapshotMetadata");
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("스냅샷 메타 데이타 다운로드에 실패했습니다.")}
      </Typography>
      <Typography variant="subtitle1">
        {locale("인터넷 연결 상태를 확인한 후에 다시 시도해주십시오.")}
      </Typography>
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRestart}
      >
        {locale("재시작")}
      </Button>
    </div>
  );
};

export default ErrorDownloadSnapshotMetadataFailedView;
