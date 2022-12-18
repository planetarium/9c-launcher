import React, { useState } from "react";
import { observer } from "mobx-react";
import Layout from "../components/core/Layout";
import H1 from "../components/ui/H1";
import { T } from "src/renderer/i18n";
import { Select, SelectOption } from "../components/ui/Select";
import { useStore } from "../utils/useStore";
import { Address } from "src/interfaces/keystore";
import Button from "../components/ui/Button";
import { useHistory } from "react-router";

const transifexTags = "v2/revoke-view";

function RevokeView() {
  const account = useStore("account");
  const [address, setAddress] = useState<Address>(account.keyring[0].address);
  const history = useHistory();

  return (
    <Layout sidebar flex>
      <H1>
        <T _str="Revoke your private key" _tags={transifexTags} />
      </H1>
      <T
        _str={
          "Delete all records related to your account.\n" +
          "Nine Chronicles is a fully decentralized game. Therefore, there is no central server that manages your password.\n" +
          "If you lose your private key, you must create a new account to play the game from the beginning.\n" +
          "Private keys can be found in the Settings menu of the in-game, so make sure to copy them separately next time and keep them in a safe place."
        }
        _tags={transifexTags}
      />
      <Select value={address} onChange={(v) => setAddress(v)}>
        {account.keyring.map((key) => (
          <SelectOption key={key.address} value={key.address}>
            {key.address}
          </SelectOption>
        ))}
      </Select>
      <Button
        variant="primary"
        centered
        onClick={() => {
          account.removeKeyByAddress(address);
          history.push("/");
        }}
      >
        <T _str="Revoke this key" _tags={transifexTags} />
      </Button>
    </Layout>
  );
}

export default observer(RevokeView);
