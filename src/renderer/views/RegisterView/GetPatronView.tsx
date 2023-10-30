import { observer } from "mobx-react";
import { shell } from "electron";
import { get, NodeInfo } from "src/config";
import React, { useEffect, useState } from "react";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import { useStore } from "src/utils/useStore";
import { useCheckContractedQuery } from "src/generated/graphql";
import { registerStyles } from ".";
import TextField from "src/renderer/components/ui/TextField";
import {
  Select,
  SelectLabel,
  SelectOption,
  SelectWrapper,
} from "src/renderer/components/ui/Select";
import { ExtLink } from "src/renderer/components/ui/Link";
import Button from "src/renderer/components/ui/Button";
import { useHistory } from "react-router";

const transifexTags = "v2/views/register/GetPatronView";

function GetPatronView() {
  const [disable, setDisable] = useState(false);
  const [planetId, setPlanetId] = useState<string>(get("Planet"));
  const [switching, setSwitching] = useState(false);
  const { account, planetary } = useStore();
  const { data, refetch } = useCheckContractedQuery({
    variables: {
      agentAddress: account.loginSession?.address.toHex(),
    },
  });
  const history = useHistory();

  const switchPlanet = (id: string) => {
    setSwitching(true);
    setPlanetId(id);
    planetary.changePlanet(id).then(() => {
      refetch();
      setSwitching(false);
    });
  };

  useEffect(() => {
    if (data?.stateQuery.pledge.approved) {
      console.log("go lobby");
      history.push("/lobby");
    }
  }, [data]);

  return (
    <Layout sidebar flex css={registerStyles}>
      <H1>
        <T _str="You need a patron" _tags={transifexTags} />
      </H1>
      <p style={{ margin: 0, paddingBottom: 150 }}>
        <T
          _str="To play the game, you'll need a patron, but fortunately, Planetarium will act as yours. To complete this step, just sign up for the Nine Chronicles portal and link your account."
          _tags={transifexTags}
        />
      </p>
      <SelectWrapper>
        <SelectLabel id="planet-label">Planet</SelectLabel>
        <Select
          labelId="planet-label"
          value={planetId}
          defaultValue={planetary.planet.id}
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
      <TextField
        label="Address"
        readOnly
        value={account.loginSession?.address.toString()}
      />
      <Button
        variant="primary"
        centered
        css={{ fontSize: 24, width: 360, marginTop: 25, fontWeight: 600 }}
        disabled={disable || switching}
        onClick={() => {
          shell.openExternal(
            get("ActivationCodeUrl") +
              "&address=" +
              account.loginSession!.address.toHex() +
              "&planet=" +
              planetId,
          );
          setDisable(true);
          setTimeout(() => {
            setDisable(false);
          }, 15000);
        }}
      >
        <T _str="Sign up for the portal" _tags={transifexTags} />
      </Button>
      <ExtLink
        centered
        style={{
          color: "#74f4bc",
          fontWeight: 300,
        }}
        href="https://docs.nine-chronicles.com/introduction/guide/nine-chronicles-portal/patron" // will be embedded in config.json. or else?
      >
        <T
          _str="Can I have a different patron, not Planetarium?"
          _tags={transifexTags}
        />
      </ExtLink>
    </Layout>
  );
}

export default observer(GetPatronView);
