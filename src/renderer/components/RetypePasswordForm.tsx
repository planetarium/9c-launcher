import React, { useState, ChangeEvent, MouseEvent } from "react";

import { useLocale } from "../i18n";

import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import VisibilityAdornment from "./VisibilityAdornment";
import { makeStyles } from "@material-ui/styles";

import { CreateAccount } from "../../interfaces/i18n";

interface RetypePasswordFormProps {
  onSubmit: (password: string) => void;
}

const RetypePasswordForm = ({ onSubmit }: RetypePasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { locale } = useLocale<CreateAccount>("createAccount");

  const classes = createStyle();

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);
  };

  const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPassword(!showPassword);
  };

  const handleShowPasswordConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const disabled = password.length === 0 || password !== passwordConfirm;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(password);
  };

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FormControl fullWidth>
        <InputLabel className={classes.label}>{locale("비밀번호")}</InputLabel>
        <OutlinedInput
          id="password-input"
          onChange={handlePasswordChange}
          className={classes.textInput}
          type={showPassword ? "text" : "password"}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPassword}
              show={showPassword}
            />
          }
        />
      </FormControl>
      <FormControl fullWidth>
        <InputLabel className={classes.label}>
          {locale("비밀번호 (확인)")}
        </InputLabel>
        <OutlinedInput
          id="password-confirm-input"
          error={password !== passwordConfirm}
          type={showPasswordConfirm ? "text" : "password"}
          onChange={handlePasswordConfirmChange}
          className={classes.textInput}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPasswordConfirm}
              show={showPasswordConfirm}
            />
          }
        />
      </FormControl>
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
  textInput: {
    marginBottom: "40px;",
    "& .Mui-focused": {
      color: "#ffffff",
    },
  },
  label: {
    marginLeft: "14px",
  },
  submit: {
    display: "block",
    margin: "0 auto 0 auto",
    width: "200px",
    height: "50px",
  },
});
