import React, { useEffect } from "react";
import { ipcRenderer, remote } from "electron";
import errorViewStyle from "./ErrorView.style";
import { Button, Typography } from "@material-ui/core";
import { BLOCKCHAIN_STORE_PATH } from "../../../config";
import * as Sentry from "@sentry/electron";
import { useLocale } from "../../i18n";
import { ErrorNoPermission } from "../../../interfaces/i18n";

const ErrorNoPermissionView = () => {
  const classes = errorViewStyle();

  const { locale } = useLocale<ErrorNoPermission>("errorNoPermission");

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorNoPerm");
    Sentry.captureException(
      new Error("Error occurred while creating directory.")
    );
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        {locale("권한이 없습니다.")}
      </Typography>
      <Typography variant="subtitle1">
        {locale("아래 경로에 애플리케이션이 접근할 수 없습니다:")}
        <br />
        <code className={classes.code}>{BLOCKCHAIN_STORE_PATH}</code>
        <br />
        {locale("체인 경로를 아래의 단계를 따라 바꿔주세요.")}
      </Typography>
      <ol>
        <li>{locale("오른쪽의 버튼을 클릭하여 설정 페이지를 여세요.")}</li>
        <li>
          {locale(
            '"경로 선택하기" 버튼을 클릭해서 체인이 저장되는 경로를 바꿔주세요.'
          )}
        </li>
      </ol>
    </div>
  );
};

export default ErrorNoPermissionView;
