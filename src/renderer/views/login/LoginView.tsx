import React, { useState, useEffect, MouseEvent } from "react";
import mixpanel from "mixpanel-browser";
import { IStoreContainer } from "../../../interfaces/store";
import { LoginFormEvent } from "../../../interfaces/event";

import {
  Box,
  Button,
  Grid,
  InputLabel,
  IconButton,
  TextField,
  Typography,
  FormControl,
  OutlinedInput,
  Popover,
  PopoverProps,
} from "@material-ui/core";
import { FileCopy } from "@material-ui/icons";
import { usePopupState, bindPopover } from "material-ui-popup-state/hooks";
import { clipboard, ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";

import { useDecryptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { Select } from "../../components/Select";
import ClearCacheButton from "../../components/ClearCacheButton";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import VisibilityAdornment from "../../components/VisibilityAdornment";

import loginViewStyle from "./LoginView.style";
import { useLocale } from "../../i18n";
import TextButton from "../../components/TextButton";
import { Login } from "../../../interfaces/i18n";

const popoverLayout: Pick<PopoverProps, "anchorOrigin" | "transformOrigin"> = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center",
  },
};

const LoginView = observer(
  ({ accountStore, routerStore, standaloneStore }: IStoreContainer) => {
    const classes = loginViewStyle();
    const [isInvalid, setInvalid] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const addressCopiedPopupState = usePopupState({
      variant: "popover",
      popupId: "addressCopiedPopup",
    });

    const [
      getDecryptedKey,
      { loading, error, data },
    ] = useDecryptedPrivateKeyLazyQuery();

    useEffect(() => {
      if (data?.keyStore?.decryptedPrivateKey !== undefined) {
        const privateKey = data.keyStore.decryptedPrivateKey;
        accountStore.setPrivateKey(privateKey);
        accountStore.toggleLogin();
        const installerUUID = ipcRenderer.sendSync(
          "get-installer-mixpanel-uuid"
        ) as string | null;
        if (installerUUID !== null) {
          mixpanel.alias(accountStore.selectedAddress, installerUUID);
        }
        mixpanel.identify(accountStore.selectedAddress);
        mixpanel.track("Launcher/Login");
        routerStore.push("/login/mining");
      }
    }, [data]);

    useEffect(() => {
      /**
       * 에러가 아니어도 error에 값이 들어옴. 해당 값이 실제 error인지 검사하기 위해서는 error 안에 메세지가 있는지 검사해야 함.
       * error가 undefined인 경우: Query를 수행하지 않은 경우
       * error.message가 undefined인 경우: 에러가 아님
       **/
      if (error?.message !== undefined) {
        setInvalid(true);
        mixpanel.track("Launcher/LoginFailed");
      }
    }, [error]);

    const handleSubmit = (event: LoginFormEvent) => {
      event.preventDefault();
      getDecryptedKey({
        variables: {
          address: accountStore.selectedAddress,
          passphrase: event.target.password.value,
        },
      });
    };

    const handleResetPassword = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      routerStore.push("/account/reset/review-private-key");
    };

    const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
      setShowPassword(!showPassword);
    };

    const copyAddress = (e: MouseEvent<HTMLButtonElement>) => {
      clipboard.writeText(accountStore.selectedAddress);
      addressCopiedPopupState.open(e.currentTarget);
    };

    // FIXME 키가 하나도 없을때 처리는 안해도 되지 않을지?
    if (!accountStore.selectedAddress && accountStore.addresses.length > 0) {
      accountStore.setSelectedAddress(accountStore.addresses[0]);
    }

    const { locale } = useLocale<Login>("login");
    return (
      <div className={`login ${classes.root}`}>
        <NineChroniclesLogo />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <article className={classes.ID}>
                <InputLabel className={classes.label}>
                  {locale("ID")}
                  <IconButton
                    size="small"
                    component="span"
                    onClick={copyAddress}
                  >
                    <FileCopy fontSize="small" />
                  </IconButton>
                </InputLabel>
                <ClearCacheButton className={classes.cacheButton}>
                  {locale("캐시 지우기")}
                </ClearCacheButton>
              </article>
              <Popover
                {...bindPopover(addressCopiedPopupState)}
                {...popoverLayout}
              >
                {locale("클립보드에 복사되었습니다!")}
              </Popover>
              <Select
                items={accountStore.addresses}
                onChange={accountStore.setSelectedAddress}
                value={accountStore.selectedAddress}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel className={classes.label}>
                {locale("비밀번호")}
              </InputLabel>
              <FormControl fullWidth>
                <OutlinedInput
                  type={showPassword ? "text" : "password"}
                  name="password"
                  error={isInvalid}
                  onChange={() => setInvalid(false)}
                  endAdornment={
                    <VisibilityAdornment
                      onClick={handleShowPassword}
                      show={showPassword}
                    />
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          <Box className={classes.submitWrapper}>
            <Button
              className={classes.loginButton}
              type="submit"
              variant="contained"
              color="primary"
            >
              {locale("로그인")}
            </Button>
            <TextButton
              className={classes.resetLink}
              onClick={handleResetPassword}
            >
              {locale("비밀번호 찾기")}
            </TextButton>
          </Box>
        </form>
      </div>
    );
  }
);

export default inject(
  "accountStore",
  "routerStore",
  "standaloneStore"
)(LoginView);
