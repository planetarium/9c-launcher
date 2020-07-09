import * as React from "react";
import { useState } from "react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  Button,
  InputLabel,
  TextField,
  Typography,
  Box,
  Grid,
} from "@material-ui/core";
import { observer, inject } from "mobx-react";
import "../../styles/login/login.scss";
import { useDecreyptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { AccountSelect } from "../../components/AccountSelect";
import ClearCacheButton from "../../components/ClearCacheButton";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import loginViewStyle from "./LoginView.style";
import DownloadSnapshotButton from "../../components/DownloadSnapshotButton";

const LoginView = observer(
  ({ accountStore, routerStore, standaloneStore }: IStoreContainer) => {
    const classes = loginViewStyle();
    const [passphrase, setPassphrase] = useState("");
    const [isSnapshotProgress, setSnapshotProgressState] = useState(false);
    const [
      getDecreyptedKey,
      { loading, data },
    ] = useDecreyptedPrivateKeyLazyQuery();

    React.useEffect(() => {
      if (data?.keyStore?.decryptedPrivateKey !== undefined) {
        const privateKey = data.keyStore.decryptedPrivateKey;
        accountStore.setPrivateKey(privateKey);
        accountStore.toggleLogin();
        if (standaloneStore.NoMiner) {
          routerStore.push("/login/mining");
        } else {
          routerStore.push("/lobby/preload");
          standaloneStore
            .initStandalone(accountStore.privateKey)
            .catch((error) => {
              console.log(error);
              routerStore.push("/error");
            });
        }
      }
    }, [data]);

    const handleSubmit = () => {
      getDecreyptedKey({
        variables: {
          address: accountStore.selectedAddress,
          passphrase: passphrase,
        },
      });
    };

    // FIXME 키가 하나도 없을때 처리는 안해도 되지 않을지?
    if (!accountStore.selectedAddress && accountStore.addresses.length > 0) {
      accountStore.setSelectedAddress(accountStore.addresses[0]);
    }

    return (
      <div className={`login ${classes.root}`}>
        <NineChroniclesLogo />
        <Box>
          <ClearCacheButton className={classes.cacheButton} />
          <DownloadSnapshotButton
            setSnapshotProgressState={setSnapshotProgressState}
            className={classes.downloadButton}
          />
        </Box>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
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
                variant="outlined"
                onChange={(event) => {
                  setPassphrase(event.target.value);
                }}
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
              disabled={isSnapshotProgress}
            >
              Login
            </Button>
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
