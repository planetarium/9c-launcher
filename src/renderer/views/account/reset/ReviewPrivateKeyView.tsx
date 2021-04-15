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
import { useLocale } from "../../../i18n";
import { InputPrivateKey } from "../../../../interfaces/i18n";
import AccountStore from "../../../stores/account";
import reviewPrivateKeyViewStyle from "./ReviewPrivateKeyView.style";
import TextButton from "../../../components/TextButton";

interface IReviewPrivateKeyViewProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const ReviewPrivateKeyView: React.FC<IReviewPrivateKeyViewProps> = observer(
  ({ accountStore, routerStore }) => {
    const [privateKey, setPrivateKey] = useState("");
    const [isInvalid, setIsInvalid] = useState<boolean>();

    const classes = reviewPrivateKeyViewStyle();

    const { locale } = useLocale<InputPrivateKey>("inputPrivateKey");

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
            {locale("뒤로")}
          </Button>
        </div>
        <Typography variant="h1" className={classes.title}>
          {locale("비밀번호를 재설정하기 위해 개인키를 입력해주세요.")}
        </Typography>
        <FormControl fullWidth>
          <InputLabel className={classes.label}>{locale("개인키")}</InputLabel>
          <OutlinedInput error={isInvalid} onChange={privateKeyChangeHandle} />
        </FormControl>
        <Button
          color="primary"
          className={classes.submit}
          onClick={handleSubmit}
        >
          {locale("Enter")}
        </Button>
        <TextButton onClick={handleRevokeAccount} className={classes.revoke}>
          {locale("개인키를 잊으셨나요?")}
        </TextButton>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(ReviewPrivateKeyView);
