import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Layout from "../../components/core/Layout";
import { useStore } from "src/v2/utils/useStore";
import { useHistory } from "react-router";
import { CSS, styled } from "src/v2/stitches.config";
import { ipcRenderer } from "electron";
import H1 from "src/v2/components/ui/H1";
import { PasswordField } from "src/v2/components/ui/TextField";
import Button from "src/v2/components/ui/Button";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import { Link } from "src/v2/components/ui/Link";
import { T } from "src/renderer/i18n";
import Form from "src/v2/components/ui/Form";
import { preloadService } from "src/v2/machines/preloadMachine";
import { get } from "src/config";
import toast from "react-hot-toast";
import _refiner from "refiner-js";
import { trackEvent } from "src/v2/utils/mixpanel";

const transifexTags = "v2/login-view";

function LoginView() {
  const { account } = useStore();
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const history = useHistory();

  const handleLogin = () => {
    account.getAccount(account.selectedAddress, password).then(
      () => {
        account.setLoginStatus(true);
        ipcRenderer.send("mixpanel-alias", account.selectedAddress);
        trackEvent("Launcher/Login");

        _refiner("setProject", "43e75b10-c10d-11ec-a73a-958e7574f4fc");
        _refiner("identifyUser", {
          id: account.selectedAddress,
          config: {
            rpc: get("UseRemoteHeadless"),
            locale: get("Locale"),
          },
        });
        localStorage.setItem("lastAddress", account.selectedAddress);
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
    const defaultAddress =
      localStorage.getItem("lastAddress") ?? account.V3Keys[0].address;
    if (!account.selectedAddress && account.V3Keys.length > 0) {
      account.setSelectedAddress(defaultAddress);
      // TODO: Persist the last chosen address
    }
  }, [account.V3Keys, account.selectedAddress]);

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Login" _tags={transifexTags} />
      </H1>
      <p>
        <T _str="Welcome back Nine Chronicles!" _tags={transifexTags} />
      </p>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Select
          value={account.selectedAddress}
          onChange={(v) => account.setSelectedAddress(v)}
        >
          {account.V3Keys.map((key) => (
            <SelectOption key={key.address} value={key.address}>
              {key.address}
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
