import * as React from "react";
import { useState } from "react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  FormControl,
  Button,
  Input,
  InputLabel,
  TextField,
  Container,
  Box,
  Grid,
} from "@material-ui/core";
import { observer, inject } from "mobx-react";
import "../../styles/login/login.scss";
import { useDecreyptedPrivateKeyLazyQuery } from "../../../generated/graphql";
import { AccountSelect } from "../../components/AccountSelect";
import ClearCacheButton from "../../components/ClearCacheButton";

const LoginView = observer(
  ({ accountStore, routerStore, standaloneStore }: IStoreContainer) => {
    const [passphrase, setPassphrase] = useState("");
    const [openSnackbar, setSnackbarStatus] = useState(false);
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
          routerStore.push("/lobby/mining");
        } else {
          routerStore.push("/lobby");
          standaloneStore
            .initStandalone(accountStore.privateKey)
            .catch((error) => {
              console.log(error);
              routerStore.push("/error");
            });
        }
      }
    });

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
      <div className="login">
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
                onChange={(event) => {
                  setPassphrase(event.target.value);
                }}
                fullWidth
              ></TextField>
            </Grid>
          </Grid>
          <Box>
            <Button
              id="login-button"
              type="submit"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          </Box>
        </form>
        <Box id="clear-cache">
          <ClearCacheButton disabled={false} />
        </Box>
      </div>
    );
  }
);

export default inject(
  "accountStore",
  "routerStore",
  "standaloneStore"
)(LoginView);
