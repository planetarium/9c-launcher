import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import ActivationCodeForm, {
  FormData,
} from "src/renderer/components/ActivationCodeForm";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import { trackEvent } from "src/utils/mixpanel";
import { useStore } from "src/utils/useStore";
import { registerStyles } from ".";

const transifexTags = "v2/views/register/ActivationCodeView";

function ActivationCodeView() {
  const accountStore = useStore("account");
  const history = useHistory();

  const onSubmit = async ({ activationCode }: FormData) => {
    trackEvent("Launcher/EnterActivationCode");
    accountStore.setActivationCode(activationCode);

    history.push("/register/activationWait");
  };

  return (
    <Layout sidebar flex css={registerStyles}>
      <H1>
        <T _str="Activate your address" _tags={transifexTags} />
      </H1>
      <p style={{ margin: 0 }}>
        <T
          _str="You need an activation code to activate your Nine Chronicles address. If you already have one, you can paste it below and activate it now."
          _tags={transifexTags}
        />
      </p>
      <ActivationCodeForm onSubmit={onSubmit} />
    </Layout>
  );
}

export default observer(ActivationCodeView);
