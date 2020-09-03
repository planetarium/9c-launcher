import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Button, Typography } from "@material-ui/core";
import AccountStore from "../../stores/account";
import { RouterStore } from "mobx-react-router";
import { useRevokePrivateKeyMutation } from "../../../generated/graphql";
import revokeAccountViewStyle from "./RevokeAccountView.style";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

import { useLocale } from "../../i18n";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }) => {
    const [revokePrivateKey] = useRevokePrivateKeyMutation();

    const { locale } = useLocale("revokeAccount");

    const description = locale("description");

    if (typeof description === "string")
      throw Error(
        "revokeAccount.description is not array in src/i18n/index.json"
      );

    const classes = revokeAccountViewStyle();
    return (
      <div className={classes.root}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => {
            routerStore.push("/");
          }}
        >
          {locale("Back")}
        </Button>
        <Typography className={classes.title}>
          {locale("Revoke your account")}
        </Typography>
        <Typography>
          {description[0]}
          <br />
          <br />
          {description[1]}
          <br />
          {description[2]}
          <br />
          <br />
          {description[3]}
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
          {locale("revoke key")}
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(RevokeAccountView);
