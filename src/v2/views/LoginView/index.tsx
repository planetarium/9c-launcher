import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Layout from "../../components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";
import { useHistory } from "react-router";
import { CSS, styled } from "src/v2/stitches.config";

import H1 from "src/v2/components/ui/H1";
import TextField from "src/v2/components/ui/TextField";
import Button from "src/v2/components/ui/Button";

const LoginStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  "& > * + *": {
    marginTop: 16,
  },
  height: "100%",
  marginBottom: 52,
};

const Center = styled("div", {
  textAlign: "center",
});

function LoginView() {
  const { account } = useStore();
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const history = useHistory();

  const handleLogin = () => {
    const [unprotectedPrivateKey, error] = ipcRenderer.sendSync(
      "unprotect-private-key",
      account.selectedAddress,
      password
    );
    if (error !== undefined) {
      setInvalid(true);
      ipcRenderer.send("mixpanel-track-event", "Launcher/LoginFailed");
    }

    if (unprotectedPrivateKey !== undefined) {
      account.setPrivateKey(unprotectedPrivateKey);
      account.setLoginStatus(true);
      ipcRenderer.send("mixpanel-alias", account.selectedAddress);
      ipcRenderer.send("mixpanel-track-event", "Launcher/Login");
      history.push("/lobby");
    }
  };

  useEffect(() => {
    account.setSelectedAddress(account.addresses[0]); // Testing
  }, [account]);

  return (
    <Layout sidebar css={LoginStyles}>
      <H1>Login</H1>
      <p>Welcome back Nine Chronicles!</p>
      <TextField label="ID" readOnly value={account.selectedAddress} />
      <TextField
        label="Password"
        type="password"
        value={password}
        invalid={invalid}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Center>
        <Button
          variant="primary"
          onClick={handleLogin}
          css={{ width: 280, marginTop: "auto", alignSelf: "center" }}
        >
          LOGIN
        </Button>
      </Center>
    </Layout>
  );
}

export default observer(LoginView);
