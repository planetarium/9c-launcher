import * as React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Button, Typography } from "@material-ui/core";
import AccountStore from "../../stores/account";
import { RouterStore } from "mobx-react-router";
import { AccountSelect } from "../../components/AccountSelect";
import { useRevokePrivateKeyMutation } from "../../../generated/graphql";
import revokeAccountViewStyle from "./RevokeAccountView.style";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }: IRevokeAccountProps) => {
    const [revokePrivateKey] = useRevokePrivateKeyMutation();
    const classes = revokeAccountViewStyle();
    return (
      <div className={classes.root}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => {
            routerStore.push("/");
          }}
        >
          Back
        </Button>
        <Typography className={classes.title}>Revoke your account</Typography>
        <Typography>
          Delete all records related to your account.
          <br />
          <br />
          Nine Chronicles is a fully decentralized game. Therefore, there is no
          central server that manages your password. <br />
          If you don’t remember your private key, you must create a new account
          to play the game from the beginning. <br />
          <br />
          Private keys can be found in the Settings menu of the game, so make
          sure to copy them separately next time and keep them in a safe place.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.revoke}
          fullWidth
          onClick={(event) => {
            event.preventDefault();
            Promise.all(
              accountStore.addresses.map((address) =>
                revokePrivateKey({
                  variables: {
                    address,
                  },
                })
              )
            ).then((executionResult) => {
              executionResult.forEach((r) => {
                const revokedAddress =
                  r.data?.keyStore?.revokePrivateKey?.address;
                if (revokedAddress) accountStore.removeAddress(revokedAddress);
              });
              routerStore.push("/main");
            });
          }}
        >
          Revoke Key
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(RevokeAccountView);
