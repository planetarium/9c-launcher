import * as React from "react";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";
import { Button, TextField, Typography } from "@material-ui/core";
import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CopyCreatedPrivateKeyView.style";
import { RouterStore } from "mobx-react-router";
import { clipboard } from "electron";

interface ICopyCreatedPrivateKeyProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CopyCreatedPrivateKeyView: React.FC<ICopyCreatedPrivateKeyProps> = observer(
  ({ accountStore, routerStore }: ICopyCreatedPrivateKeyProps) => {
    const classes = createAccountViewStyle();

    return (
      <div className={classes.root}>
        <Typography className={classes.title}>
          Almost done!
          <br />
          Please copy and store
          <br />
          your private key in a safe place.
        </Typography>
        <Typography className={classes.description}>
          Nine Chronicles is a fully decentralized game.
          <br />
          Therefore, there is no central server that manages your password.
        </Typography>
        <br />
        <Typography className={classes.warning}>
          This key is the only means to recover your password.
          <br />
          Never expose the private key to others.
          <br />
          Anyone can steal your assets if this key is exposed.
        </Typography>
        <div className={classes.privateKeyContainer}>
          <h3 className={classes.privateKeyText}>Your Private key</h3>
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
              mixpanel.track("Launcher/Copy Private Key");
              clipboard.clear();
              clipboard.writeText(accountStore.privateKey);
            }}
          >
            Copy
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
          Done
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CopyCreatedPrivateKeyView);
