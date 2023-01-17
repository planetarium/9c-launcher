import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Layout from "src/renderer/components/core/Layout";
import { useStore } from "src/utils/useStore";
import { Address } from "src/interfaces/keystore";
import { useHistory } from "react-router";
import { CSS, styled } from "src/renderer/stitches.config";
import { ipcRenderer } from "electron";
import H1 from "src/renderer/components/ui/H1";
import { PasswordField } from "src/renderer/components/ui/TextField";
import Button from "src/renderer/components/ui/Button";
import { Select, SelectOption } from "src/renderer/components/ui/Select";
import { Link } from "src/renderer/components/ui/Link";
import { T } from "src/renderer/i18n";
import Form from "src/renderer/components/ui/Form";
import { get } from "src/config";
import _refiner from "refiner-js";
import { trackEvent } from "src/utils/mixpanel";

const transifexTags = "v2/login-view";

function LoginView() {
  const { account, transfer } = useStore();
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [address, setAddress] = useState<Address>(
    localStorage.getItem("lastAddress") ?? account.keyring[0].address
  );
  const history = useHistory();

  const handleLogin = () => {
    account.getAccount(address, password).then(
      (acc) => {
        account.setAccount(acc);
        account.setPrivateKeyFromAddress(address, password);
        account.setLoginStatus(true);
        ipcRenderer.send("mixpanel-alias", address);
        trackEvent("Launcher/Login");

        transfer.trySetSenderAddress(account.address);
        transfer.updateBalance(account.address);

        _refiner("setProject", "43e75b10-c10d-11ec-a73a-958e7574f4fc");
        _refiner("identifyUser", {
          id: address,
          config: {
            rpc: true,
            locale: get("Locale"),
          },
        });
        localStorage.setItem("lastAddress", address);
        history.push("/lobby");
      },
      (reject) => {
        setInvalid(true);
        trackEvent("Launcher/LoginFailed");
        console.error(reject);
      }
    );
  };

  useEffect(() => {
    async function isInKeyring(address: string) {
      return await account
        .findKeyByAddress(address)
        .catch(() => {
          return false;
        })
        .then(() => {
          return true;
        });
    }
    isInKeyring(address).then((v) => {
      if (!v) setAddress(account.keyring[0].address);
    });
  }, []);

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Login" _tags={transifexTags} />
      </H1>
      <p>
        <T _str="Welcome back Nine Chronicles!" _tags={transifexTags} />
      </p>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Select defaultValue={address} onChange={(v) => setAddress(v)}>
          {account.keyring.map((key) => (
            <SelectOption key={key.address} value={key.address}>
              {"0x" + key.address}
            </SelectOption>
          ))}
        </Select>
        <PasswordField
          label="Password"
          value={password}
          invalid={invalid}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <Button
          data-testid="login"
          variant="primary"
          centered
          onClick={handleLogin}
          css={{ width: 280 }}
        >
          <T _str="LOGIN" _tags={transifexTags} />
        </Button>
      </Form>
      <Link centered to="/forgot">
        <T _str="Forgot password?" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(LoginView);
