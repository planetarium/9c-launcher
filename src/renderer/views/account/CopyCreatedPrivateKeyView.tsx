import * as React from "react";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";

import { Button, TextField, Typography } from "@material-ui/core";
import { P } from "../../styles/styled";

import AccountStore from "../../stores/account";
import createAccountViewStyle from "./CopyCreatedPrivateKeyView.style";
import { RouterStore } from "mobx-react-router";
import { clipboard } from "electron";

import { useLocale } from "../../i18n";

interface ICopyCreatedPrivateKeyProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CopyCreatedPrivateKeyView: React.FC<ICopyCreatedPrivateKeyProps> = observer(
  ({ accountStore, routerStore }: ICopyCreatedPrivateKeyProps) => {
    const classes = createAccountViewStyle();

    const locale = useLocale("copyPrivateKey");

    return (
      <div className={classes.root}>
        <Typography className={classes.title}>
          {(locale("title") as string[]).map((paragraph) => (
            <P key={paragraph}>{paragraph}</P>
          ))}
        </Typography>
        <Typography className={classes.description}>
          {(locale("description") as string[]).map((paragraph) => (
            <P key={paragraph}>{paragraph}</P>
          ))}
        </Typography>
        <br />
        <Typography className={classes.warning}>
          {(locale("warning") as string[]).map((paragraph) => (
            <P key={paragraph}>{paragraph}</P>
          ))}
        </Typography>
        <div className={classes.privateKeyContainer}>
          <h3 className={classes.privateKeyText}>
            {locale("Your Private key")}
          </h3>
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
            {locale("Copy")}
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
          {locale("Done")}
        </Button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(CopyCreatedPrivateKeyView);
