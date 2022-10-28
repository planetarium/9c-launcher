import React, { useState, useEffect, MouseEvent } from "react";
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

import "../../styles/login/login.scss";
import { useDecryptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { get } from "../../../config";
import { Select } from "../../components/Select";
import ClearCacheButton from "../../components/ClearCacheButton";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import VisibilityAdornment from "../../components/VisibilityAdornment";

import loginViewStyle from "./LoginView.style";
import { T } from "@transifex/react";
import TextButton from "../../components/TextButton";
import _refiner from "refiner-js";

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

const transifexTags = "login";

const LoginView = observer(
  ({ accountStore, routerStore, standaloneStore }: IStoreContainer) => {
    const classes = loginViewStyle();
    const [isInvalid, setInvalid] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [unprotectedPrivateKey, setUnprotectedPrivateKey] = useState<
      string | undefined
    >(undefined);
    const addressCopiedPopupState = usePopupState({
      variant: "popover",
      popupId: "addressCopiedPopup",
    });

    useEffect(() => {
      if (unprotectedPrivateKey !== undefined) {
        accountStore.setPrivateKey(unprotectedPrivateKey);
        accountStore.setLoginStatus(true);
        ipcRenderer.send("mixpanel-alias", accountStore.selectedAddress);
        ipcRenderer.send("mixpanel-track-event", "Launcher/Login");
        _refiner("setProject", "43e75b10-c10d-11ec-a73a-958e7574f4fc");
        _refiner("identifyUser", {
          id: accountStore.selectedAddress,
          config: {
            rpc: get("UseRemoteHeadless"),
            locale: get("Locale"),
          },
        });
        if (get("UseRemoteHeadless")) {
          routerStore.push("lobby/preload");
          standaloneStore.setPrivateKeyEnded(true);
          accountStore.setMiningConfigStatus(true);
        } else {
          routerStore.push("/login/mining");
        }
        ipcRenderer.send(
          "standalone/set-signer-private-key",
          accountStore.privateKey
        );
      }
    }, [unprotectedPrivateKey]);

    const handleSubmit = (event: LoginFormEvent) => {
      event.preventDefault();
      const [unprotectedPrivateKey, error] = ipcRenderer.sendSync(
        "unprotect-private-key",
        accountStore.selectedAddress,
        event.target.password.value
      );
      if (
        error !== undefined &&
        error.toString().includes("The passphrase is wrong.")
      ) {
        setInvalid(true);
        ipcRenderer.send("mixpanel-track-event", "Launcher/LoginFailed");
      } else if (error !== undefined) {
        // Unexpected Errors.
        console.error(error);
        standaloneStore.setReady(false);
        routerStore.push("/error/reinstall");
      }

      if (
        unprotectedPrivateKey !== undefined &&
        typeof unprotectedPrivateKey === "string"
      ) {
        setUnprotectedPrivateKey(unprotectedPrivateKey.padStart(64, "0"));
      }
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

    // FIXME Skip handling when you don't have any keys
    if (!accountStore.selectedAddress && accountStore.addresses.length > 0) {
      accountStore.setSelectedAddress(accountStore.addresses[0]);
    }

    return (
      <div className={`login ${classes.root}`}>
        <NineChroniclesLogo />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <article className={classes.labelContainer}>
                <InputLabel className={classes.label}>
                  <T _str="ID" _tags={transifexTags} />
                  <IconButton
                    size="small"
                    component="span"
                    onClick={copyAddress}
                  >
                    <FileCopy fontSize="small" />
                  </IconButton>
                </InputLabel>
                <ClearCacheButton className={classes.cacheButton}>
                  <T _str="CLEAR CACHE" _tags={transifexTags} />
                </ClearCacheButton>
              </article>
              <Popover
                {...bindPopover(addressCopiedPopupState)}
                {...popoverLayout}
              >
                <T _str="Copied to clipboard!" _tags={transifexTags} />
              </Popover>
              <Select
                items={accountStore.addresses}
                onChange={accountStore.setSelectedAddress}
                value={accountStore.selectedAddress}
              />
            </Grid>
            <Grid item xs={12}>
              <article className={classes.labelContainer}>
                <InputLabel className={classes.label}>
                  <T _str="Password" _tags={transifexTags} />
                </InputLabel>
                <InputLabel error className={classes.label}>
                  {isInvalid && (
                    <T _str="Invalid password" _tags={transifexTags} />
                  )}
                </InputLabel>
              </article>
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
              <T _str="Login" _tags={transifexTags} />
            </Button>
            <TextButton
              className={classes.resetLink}
              onClick={handleResetPassword}
            >
              <T _str="Forgot password?" _tags={transifexTags} />
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
