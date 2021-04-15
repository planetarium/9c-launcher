import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React, { useState, ChangeEvent, MouseEvent } from "react";
import zxcvbn from "zxcvbn";
import { RetypePassword } from "../../interfaces/i18n";
import { useLocale } from "../i18n";
import VisibilityAdornment from "./VisibilityAdornment";

interface RetypePasswordFormProps {
  onSubmit: (password: string, activationKey: string) => void;
  useActivationKey: boolean;
}

const RetypePasswordForm = ({
  onSubmit,
  useActivationKey,
}: RetypePasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordConfirmAllowsEmpty, setPasswordConfirmAllowsEmpty] = useState(
    true
  );
  const [activationKey, setActivationKey] = useState("");
  const [activationKeyAllowsEmpty, setActivationKeyAllowsEmpty] = useState(
    true
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { locale } = useLocale<RetypePassword>("retypePassword");

  const classes = createStyle();

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    if (e.target.value.trim().length === 0) {
      setPasswordConfirmAllowsEmpty(true);
    }
  };

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);

    if (password.trim().length > 0) {
      setPasswordConfirmAllowsEmpty(false);
    }
  };

  const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPassword(!showPassword);
  };

  const handleShowPasswordConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const handleActivationKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActivationKey(e.target.value);
    setActivationKeyAllowsEmpty(false);
  };

  const validateActivationKey = (code: string) => {
    if (code === null) {
      return false;
    }

    code = code.trim();
    if (code.length === 0 || code.indexOf("/") < 0) {
      return false;
    }

    const splits = code.split("/");
    const privateKey = splits[0];
    const address = splits[1];
    if (privateKey.length !== 64 || address.length !== 40) {
      return false;
    }

    return true;
  };

  const isPasswordEmpty = password.trim().length === 0;
  const isPasswordConfirmEmpty = passwordConfirm.trim().length === 0;
  const isPasswordConfirmError = isPasswordConfirmEmpty
    ? !passwordConfirmAllowsEmpty
    : password !== passwordConfirm;
  const isActivationKeyEmpty = activationKey.trim().length === 0;
  const isActivationKeyError = isActivationKeyEmpty
    ? !activationKeyAllowsEmpty
    : !validateActivationKey(activationKey);
  const disabled =
    isPasswordEmpty ||
    isPasswordConfirmEmpty ||
    isPasswordConfirmError ||
    (useActivationKey ? isActivationKeyEmpty || isActivationKeyError : false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(password, activationKey);
  };

  function strengthHint(password: string) {
    const { warning } = zxcvbn(password).feedback;
    if (warning === "") return "";
    return locale(warning);
  }

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FormControl
        fullWidth
        error={password.length > 0 && isPasswordEmpty}
        className={classes.formControl}
      >
        <InputLabel className={classes.label}>{locale("비밀번호")}</InputLabel>
        <OutlinedInput
          id="password-input"
          onChange={handlePasswordChange}
          type={showPassword ? "text" : "password"}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPassword}
              show={showPassword}
            />
          }
        />
        <FormHelperText className={classes.helperText}>
          {password.length > 0 && strengthHint(password)}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        error={isPasswordConfirmError}
        className={classes.formControl}
      >
        <InputLabel className={classes.label}>
          {locale("비밀번호 (확인)")}
        </InputLabel>
        <OutlinedInput
          id="password-confirm-input"
          type={showPasswordConfirm ? "text" : "password"}
          onChange={handlePasswordConfirmChange}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPasswordConfirm}
              show={showPasswordConfirm}
            />
          }
        />
        <FormHelperText className={classes.helperText}>
          {passwordConfirm.length > 0 && strengthHint(passwordConfirm)}
        </FormHelperText>
      </FormControl>
      {useActivationKey ? (
        <FormControl
          fullWidth
          error={isActivationKeyError}
          className={classes.formControl}
        >
          <InputLabel className={classes.label}>
            {locale("초대 코드")}
          </InputLabel>
          <OutlinedInput type="text" onChange={handleActivationKeyChange} />
          <FormHelperText className={classes.helperText}>
            form helper text
          </FormHelperText>
        </FormControl>
      ) : (
        <></>
      )}
      <Button
        disabled={disabled}
        color="primary"
        type="submit"
        className={classes.submit}
        variant="contained"
      >
        {locale("확인")}
      </Button>
    </form>
  );
};

export default RetypePasswordForm;

const createStyle = makeStyles({
  formControl: {
    marginBottom: "0.5em",
  },
  label: {
    marginLeft: "14px",
  },
  helperText: {
    height: "38px",
  },
  submit: {
    display: "block",
    margin: "0 auto 0 auto",
    width: "200px",
    height: "50px",
  },
});
