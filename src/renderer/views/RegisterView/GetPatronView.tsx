import { observer } from "mobx-react";
import { shell } from "electron";
import { get } from "src/config";
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

function GetPatronView() {
  const [disable, setDisable] = useState(false);
  const account = useStore("account");

  return (
    <Layout sidebar flex css={registerStyles}>
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
        value={account.loginSession?.address.toHex()}
      />
      <Button
        variant="primary"
        centered
        css={{ fontSize: 32, width: 300, marginTop: 50 }}
        disabled={disable}
        onClick={() => {
          shell.openExternal(
            get("ActivationCodeUrl") +
              "&address=" +
              account.loginSession!.address.toHex()
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
