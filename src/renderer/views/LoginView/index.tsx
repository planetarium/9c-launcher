import React, { useState } from "react";
import { observer } from "mobx-react";
import Layout from "src/renderer/components/core/Layout";
import { useStore } from "src/utils/useStore";
import { useHistory } from "react-router";
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
import { Controller, SubmitHandler, useForm } from "react-hook-form";

const transifexTags = "v2/login-view";

interface FormData {
  address: string;
  password: string;
}

function LoginView() {
  const { account: accountStore, transfer } = useStore();
  const [invalid, setInvalid] = useState(false);
  const keyringAddresses = accountStore.keyring.map((k) => k.address);
  const defaultAddress = getLastLoggedinAddress();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function getLastLoggedinAddress() {
    const stored = localStorage.getItem("lastAddress");

    if (stored && keyringAddresses.filter((a) => a === stored).length > 0) {
      return stored;
    }

    return keyringAddresses[0];
  }

  const history = useHistory();

  const handleLogin: SubmitHandler<FormData> = async ({
    address,
    password,
  }) => {
    try {
      localStorage.setItem("lastAddress", address);
      const account = await accountStore.getAccount(address, password);
      await accountStore.login(account, password);
      accountStore.setLoginStatus(true);
      ipcRenderer.send("mixpanel-alias", address);
      trackEvent("Launcher/Login");

      await transfer.trySetSenderAddress(address);
      await transfer.updateBalance(address);

      _refiner("setProject", "43e75b10-c10d-11ec-a73a-958e7574f4fc");
      _refiner("identifyUser", {
        id: address,
        config: {
          rpc: true,
          locale: get("Locale"),
        },
      });
      history.push("/lobby");
    } catch (error) {
      setInvalid(true);
      trackEvent("Launcher/LoginFailed");
      console.error(error);
    }
  };

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Login" _tags={transifexTags} />
      </H1>
      <p>
        <T _str="Welcome back Nine Chronicles!" _tags={transifexTags} />
      </p>
      <Form onSubmit={handleSubmit(handleLogin)}>
        <Controller
          control={control}
          defaultValue={defaultAddress}
          {...register("address")}
          render={({ field }) => (
            <Select {...field}>
              {keyringAddresses.map((address) => (
                <SelectOption key={address} value={address}>
                  {"0x" + address}
                </SelectOption>
              ))}
            </Select>
          )}
        />

        <PasswordField
          label="Password"
          invalid={invalid || !!errors.password}
          autoFocus
          {...register("password")}
        />
        <Button
          data-testid="login"
          variant="primary"
          centered
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
