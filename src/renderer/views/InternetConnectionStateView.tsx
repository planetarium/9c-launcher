import { Button, Typography } from "@material-ui/core";
import { ipcRenderer, remote } from "electron";
import React, { useCallback, useEffect, useState } from "react";
import { InternetConnectionState } from "../../interfaces/i18n";
import { useLocale } from "../i18n";
import errorViewStyle from "./error/ErrorView.style";

const InternetConnectionStateView: React.FC = (children) => {
  const classes = errorViewStyle();
  const { locale } = useLocale<InternetConnectionState>("internetConnectionState");
  const [isConnected, setIsConnected] = useState(true);

  const handleRestart = useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);

  useEffect(() => {
    ipcRenderer.on("online-status-changed", (event, status) => {
      setIsConnected(status === "online");
    });
  }, []);

  return isConnected
    ? (<>{children}</>)
    : (
      <div className={classes.root}>
        <Typography variant="h1" gutterBottom className={classes.title}>
          {locale("인터넷 연결이 끊겼습니다.")}
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

export default InternetConnectionStateView;
