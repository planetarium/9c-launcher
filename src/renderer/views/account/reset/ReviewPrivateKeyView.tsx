import {
  InputLabel,
  Button,
  Typography,
  FormControl,
  OutlinedInput,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { ipcRenderer } from "electron";
import { observer, inject } from "mobx-react";
import { RouterStore } from "mobx-react-router";
import React, { useState, MouseEvent, ChangeEvent } from "react";
import { T } from "@transifex/react";
import AccountStore from "src/stores/account";
import reviewPrivateKeyViewStyle from "./ReviewPrivateKeyView.style";
import TextButton from "../../../components/TextButton";

interface IReviewPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const transifexTags = "inputPrivateKey";

const ReviewPrivateKeyView: React.FC<IReviewPrivateKeyViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [privateKey, setPrivateKey] = useState("");
    const [isInvalid, setIsInvalid] = useState<boolean>();

    const classes = reviewPrivateKeyViewStyle();

    const privateKeyChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
      setPrivateKey(event.target.value);
    };

    const isPrivateKeyValid = ipcRenderer.sendSync(
      "validate-private-key",
      privateKey
    );

    const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
      if (!isPrivateKeyValid) {
        setIsInvalid(true);
        return;
      }
      accountStore.setPrivateKey(privateKey);
      routerStore.push("/account/reset/reset-password");
    };

    const handleRevokeAccount = (event: MouseEvent<HTMLButtonElement>) => {
      routerStore.push("/account/revoke");
    };

    return (
      <div className={classes.root}>
        <div className={classes.floatingHeader}>
          <Button
            startIcon={<ArrowBackIosIcon />}
            onClick={() => routerStore.push("/")}
          >
            <T _str="Back" _tags={transifexTags} />
          </Button>
        </div>
        <Typography variant="h1" className={classes.title}>
          <T
            _str="Enter your private key to reset your password"
            _tags={transifexTags}
          />
        </Typography>
        <FormControl fullWidth>
          <InputLabel className={classes.label}>
            <T _str="Private Key" _tags={transifexTags} />
          </InputLabel>
          <OutlinedInput error={isInvalid} onChange={privateKeyChangeHandle} />
        </FormControl>
        <Button
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          <T _str="Enter" _tags={transifexTags} />
        </Button>
        <TextButton onClick={handleRevokeAccount} className={classes.revoke}>
          <T _str="Forgot private key?" _tags={transifexTags} />
        </TextButton>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(ReviewPrivateKeyView);
