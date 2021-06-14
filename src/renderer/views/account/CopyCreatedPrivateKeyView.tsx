import { Button, TextField, Typography } from "@material-ui/core";
import { clipboard, ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React from "react";
import { T } from "@transifex/react";
import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CopyCreatedPrivateKeyView.style";

interface ICopyCreatedPrivateKeyProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CopyCreatedPrivateKeyView: React.FC<ICopyCreatedPrivateKeyProps> = observer(
  ({ accountStore, routerStore }) => {
    const classes = createAccountViewStyle();

    return (
      <div className={classes.root}>
        <Typography variant="h1" className={classes.title}>
          <T
            _str="Almost done!\nPlease copy and store\nyour private key in a safe place."
            _keys="copyPrivateKey"
          />
        </Typography>
        <article className={classes.description}>
          <T
            _str="Nine Chronicles is a fully decentralized game.\nTherefore, there is not a server that stores your password."
            _keys="copyPrivateKey"
          />
        </article>
        <article className={classes.warning}>
          <T
            _str="This key is the only means to recover your password.\nNever expose your private key to others.\nAnyone can steal your assets if this key is exposed."
            _keys="copyPrivateKey"
          />
        </article>
        <div className={classes.privateKeyContainer}>
          <h2 className={classes.privateKeyText}>
            <T _str="Your Private key" _tags="copyPrivateKey" />
          </h2>
          <TextField
            id="created-private-key"
            variant="outlined"
            type="password"
            size="small"
            className={classes.privateKey}
            value={accountStore.privateKey}
            aria-readonly="true"
          />
          <Button
            className={classes.copyButton}
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
              ipcRenderer.send(
                "mixpanel-track-event",
                "Launcher/Copy Private Key"
              );
              clipboard.clear();
              clipboard.writeText(accountStore.privateKey);
            }}
          >
            <T _str="Copy" _tags="copyPrivateKey" />
          </Button>
        </div>
        <Button
          color="primary"
          type="submit"
          className={classes.done}
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            routerStore.push("/");
          }}
        >
          <T _str="Done" _tags="copyPrivateKey" />
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CopyCreatedPrivateKeyView);
