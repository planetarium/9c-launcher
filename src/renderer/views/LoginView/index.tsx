import { Address } from "@planetarium/account";
import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useHistory } from "react-router";
import _refiner from "refiner-js";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import Form from "src/renderer/components/ui/Form";
import H1 from "src/renderer/components/ui/H1";
import { Link } from "src/renderer/components/ui/Link";
import { Label, Select, SelectOption } from "src/renderer/components/ui/Select";
import { PasswordField } from "src/renderer/components/ui/TextField";
import { T } from "src/renderer/i18n";
import { trackEvent } from "src/utils/mixpanel";
import { useStore } from "src/utils/useStore";

const transifexTags = "v2/login-view";

interface FormData {
  address: string;
  password: string;
}

function LoginView() {
  const { account: accountStore, transfer, planetary } = useStore();
  const [invalid, setInvalid] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [planetId, setPlanetId] = useState<string>(get("Planet"));
  const defaultAddress = getLastLoggedinAddress();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  function getLastLoggedinAddress() {
    const storedHex = localStorage.getItem("lastAddress");
    const stored = storedHex && Address.fromHex(storedHex, true);

    if (
      stored &&
      accountStore.addresses.filter((a) => a.equals(stored)).length > 0
    ) {
      return stored;
    }

    return accountStore.addresses[0];
  }

  const history = useHistory();

  const switchPlanet = (id: string) => {
    setSwitching(true);
    setPlanetId(id);
    planetary.changePlanet(id).then(() => {
      setSwitching(false);
    });
  };

  const handleLogin: SubmitHandler<FormData> = async ({
    address,
    password,
  }) => {
    try {
      localStorage.setItem("lastAddress", address);
      const account = (await accountStore.getAccount(address, password))!;
      await accountStore.login(account, password);
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
          defaultValue={defaultAddress?.toHex()}
          {...register("address")}
          render={({ field }) => (
            <Select {...field}>
              {accountStore.addresses.map((address) => (
                <SelectOption key={address.toHex()} value={address.toHex()}>
                  {address.toString()}
                </SelectOption>
              ))}
            </Select>
          )}
        />
        <Select
          value={planetId}
          defaultValue={planetary.planet.id}
          onChange={switchPlanet}
        >
          {planetary.registry.map((entry) => (
            <SelectOption key={entry.id} value={entry.id}>
              {entry.name}
            </SelectOption>
          ))}
        </Select>
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
          disabled={switching}
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
