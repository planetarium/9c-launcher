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
import { clipboard } from "electron";
import { observer, inject } from "mobx-react";

import "../../styles/login/login.scss";
import { useDecreyptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { Select } from "../../components/Select";
import ClearCacheButton from "../../components/ClearCacheButton";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import VisibilityAdornment from "../../components/VisibilityAdornment";

import loginViewStyle from "./LoginView.style";
import { useLocale } from "../../i18n";
import TextButton from "../../components/TextButton";

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
      getDecreyptedKey,
      { loading, error, data },
    ] = useDecreyptedPrivateKeyLazyQuery();

    useEffect(() => {
      if (data?.keyStore?.decryptedPrivateKey !== undefined) {
        const privateKey = data.keyStore.decryptedPrivateKey;
        accountStore.setPrivateKey(privateKey);
        accountStore.toggleLogin();
        mixpanel.track("Launcher/Login");
        mixpanel.identify(accountStore.selectedAddress);
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
      getDecreyptedKey({
        variables: {
          address: accountStore.selectedAddress,
          passphrase: event.target.password.value,
        },
      });
    };

    const handleResetPassword = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      routerStore.push("/account/revoke");
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

    const { locale } = useLocale("login");
    return (
      <div className={`login ${classes.root}`}>
        <NineChroniclesLogo />
        <ClearCacheButton className={classes.cacheButton}>
          {locale("CLEAR CACHE")}
        </ClearCacheButton>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <InputLabel>
                {locale("ID")}
                <IconButton size="small" component="span" onClick={copyAddress}>
                  <FileCopy fontSize="small" />
                </IconButton>
              </InputLabel>
              <Popover
                {...bindPopover(addressCopiedPopupState)}
                {...popoverLayout}
              >
                {locale("Copied to clipboard!")}
              </Popover>
              <Select
                items={accountStore.addresses}
                onChange={accountStore.setSelectedAddress}
                value={accountStore.selectedAddress}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>{locale("Password")}</InputLabel>
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
          <Box>
            <Button
              className={classes.loginButton}
              type="submit"
              variant="contained"
              color="primary"
            >
              {locale("Login")}
            </Button>
            <TextButton
              className={classes.revokeLink}
              onClick={handleResetPassword}
            >
              {locale("Forgot password?")}
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
