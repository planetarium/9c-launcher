import * as React from "react";
import { useState } from "react";
import mixpanel from "mixpanel-browser";
import { IStoreContainer } from "../../../interfaces/store";
import { LoginFormEvent } from "../../../interfaces/event";

import {
  Box,
  Button,
  Grid,
  InputLabel,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import { observer, inject } from "mobx-react";
import "../../styles/login/login.scss";
import { useDecreyptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { AccountSelect } from "../../components/AccountSelect";
import ClearCacheButton from "../../components/ClearCacheButton";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import loginViewStyle from "./LoginView.style";

const LoginView = observer(
  ({ accountStore, routerStore, standaloneStore }: IStoreContainer) => {
    const classes = loginViewStyle();
    const [isLoginSuccess, setLoginSuccessState] = useState(true);
    const [
      getDecreyptedKey,
      { loading, error, data },
    ] = useDecreyptedPrivateKeyLazyQuery();

    React.useEffect(() => {
      if (data?.keyStore?.decryptedPrivateKey !== undefined) {
        const privateKey = data.keyStore.decryptedPrivateKey;
        accountStore.setPrivateKey(privateKey);
        accountStore.toggleLogin();
        mixpanel.track("Launcher/Login");
        mixpanel.identify(accountStore.selectedAddress);
        routerStore.push("/login/mining");
      }
    }, [data]);

    React.useEffect(() => {
      if (error?.message !== undefined) {
        setLoginSuccessState(true);
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

    const handleRevokeAccount = (e: React.MouseEvent<HTMLLinkElement>) => {
      e.preventDefault();
      routerStore.push("/account/revoke");
    };

    // FIXME 키가 하나도 없을때 처리는 안해도 되지 않을지?
    if (!accountStore.selectedAddress && accountStore.addresses.length > 0) {
      accountStore.setSelectedAddress(accountStore.addresses[0]);
    }

    return (
      <div className={`login ${classes.root}`}>
        <NineChroniclesLogo />
        <ClearCacheButton className={classes.cacheButton} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <InputLabel>ID</InputLabel>
              <AccountSelect
                addresses={accountStore.addresses}
                onChangeAddress={accountStore.setSelectedAddress}
                selectedAddress={accountStore.selectedAddress}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel>Password</InputLabel>
              <TextField
                type="password"
                name="password"
                variant="outlined"
                error={isLoginSuccess}
                onChange={() => setLoginSuccessState(true)}
                fullWidth
              ></TextField>
            </Grid>
          </Grid>
          <Box>
            <Button
              className={classes.loginButton}
              type="submit"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
            <Link
              className={classes.revokeLink}
              href="#"
              onClick={handleRevokeAccount}
            >
              Forgot password?
            </Link>
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
