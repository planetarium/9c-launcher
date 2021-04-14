import { Button, Typography } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";
import { useRevokePrivateKeyMutation } from "../../../generated/graphql";
import { RevokeAccount } from "../../../interfaces/i18n";
import { useLocale } from "../../i18n";
import AccountStore from "../../stores/account";
import revokeAccountViewStyle from "./RevokeAccountView.style";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }) => {
    const [revokePrivateKey] = useRevokePrivateKeyMutation();

    const { locale } = useLocale<RevokeAccount>("revokeAccount");

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
          onClick={() => routerStore.push("/")}
        >
          {locale("뒤로")}
        </Button>
        <Typography className={classes.title}>
          {locale("계정 지우기")}
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
            for (const address of accountStore.addresses) {
              ipcRenderer.sendSync("revoke-protected-private-key", address);
              accountStore.removeAddress(address);
            }
            routerStore.push("/main");
          }}
        >
          {locale("키 지우기")}
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(RevokeAccountView);
