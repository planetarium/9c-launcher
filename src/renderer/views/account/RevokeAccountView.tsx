import { Button, Typography } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";
import { T, useT } from "@transifex/react";
import AccountStore from "src/stores/account";
import revokeAccountViewStyle from "./RevokeAccountView.style";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const transifexTags = "revokeAccount";

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }) => {
    const t = useT();
    const classes = revokeAccountViewStyle();
    return (
      <div className={classes.root}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => routerStore.push("/")}
        >
          <T _str="Back" _tags={transifexTags} />
        </Button>
        <Typography className={classes.title}>
          <T _str="Revoke your account" _tags={transifexTags} />
        </Typography>
        <Typography>
          {t(
            "Delete all records related to your account.\n" +
              "Nine Chronicles is a fully decentralized game. Therefore, there is no central server that manages your password.\n" +
              "If you lose your private key, you must create a new account to play the game from the beginning.\n" +
              "Private keys can be found in the Settings menu of the in-game, so make sure to copy them separately next time and keep them in a safe place.",
            { _tags: "revokeAccount" }
          )}
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
          <T _str="revoke key" _tags={transifexTags} />
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(RevokeAccountView);
