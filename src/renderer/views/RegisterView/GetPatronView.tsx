import { observer } from "mobx-react";
import { shell } from "electron";
import { get, NodeInfo } from "src/config";
import React, { useState } from "react";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import { useStore } from "src/utils/useStore";
import { registerStyles } from ".";
import TextField from "src/renderer/components/ui/TextField";
import { ExtLink } from "src/renderer/components/ui/Link";
import Button from "src/renderer/components/ui/Button";

const transifexTags = "v2/views/register/GetPatronView";
const nodes = [
  new NodeInfo("9c-main-rpc-1.nine-chronicles.com", 80, 31238, 0),
  new NodeInfo("9c-internal-rpc-1.nine-chronicles.com", 80, 31238, 1),
];

function GetPatronView() {
  const [disable, setDisable] = useState(false);
  const { account, planetary } = useStore();

  return (
    <Layout sidebar flex css={registerStyles}>
      <select
        onChange={(e) => {
          planetary.setNode(nodes[parseInt(e.target.value)]);
        }}
      >
        <option value={0}>0</option>
        <option value={1}>1</option>
      </select>
      <H1>
        <T _str="You need a patron" _tags={transifexTags} />
      </H1>
      <p style={{ margin: 0, paddingBottom: 200 }}>
        <T
          _str="To play the game, you'll need a patron, but fortunately, Planetarium will act as yours. To complete this step, just sign up for the Nine Chronicles portal and link your account."
          _tags={transifexTags}
        />
      </p>
      <TextField
        label="Address"
        readOnly
        value={account.loginSession?.address.toString()}
      />
      <Button
        variant="primary"
        centered
        css={{ fontSize: 24, width: 360, marginTop: 50, fontWeight: 600 }}
        disabled={disable}
        onClick={() => {
          shell.openExternal(
            get("ActivationCodeUrl") +
              "&address=" +
              account.loginSession!.address.toHex() +
              "?planet=" +
              get("Planet"),
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
