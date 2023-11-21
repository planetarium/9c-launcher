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
import {
  SelectOption,
  Select,
  SelectWrapper,
  SelectLabel,
} from "src/renderer/components/ui/Select";
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();

  function getLastLoggedinAddress<Address>() {
    const storedHex = localStorage.getItem("lastAddress") ?? "";
    const isValidHex = /^([0-9A-Fa-f])+$/.test(storedHex);
    if (isValidHex) {
      const address = Address.fromHex(storedHex, true);
      if (accountStore.addresses.filter((a) => a.equals(address)).length > 0)
        return address.toHex();
    }
    return accountStore.addresses[0].toHex();
  }

  const defaultAddress = getLastLoggedinAddress();

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
      <SelectWrapper fullWidth>
        <SelectLabel id="planet-label">Planet</SelectLabel>
        <Select
          labelId="planet-label"
          value={planetId}
          defaultValue={planetary.planet.id}
          disabled={switching}
          onChange={(event) => switchPlanet(event.target.value as string)}
          label="Planet"
        >
          {planetary.registry.map((entry) => (
            <SelectOption key={entry.id} value={entry.id}>
              {entry.name}
            </SelectOption>
          ))}
        </Select>
      </SelectWrapper>
      <Form onSubmit={handleSubmit(handleLogin)}>
        <Controller
          name="address"
          control={control}
          defaultValue={defaultAddress}
          render={({ field }) => (
            <SelectWrapper fullWidth>
              <SelectLabel id="address-label">Address</SelectLabel>
              <Select {...field} labelId="address-label" label="Address">
                {accountStore.addresses.map((address) => (
                  <SelectOption key={address.toHex()} value={address.toHex()}>
                    {address.toString()}
                  </SelectOption>
                ))}
              </Select>
            </SelectWrapper>
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
