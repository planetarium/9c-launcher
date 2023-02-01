import React, { useEffect } from "react";
import { observer } from "mobx-react";
import Layout from "src/renderer/components/core/Layout";
import H1 from "src/renderer/components/ui/H1";
import { T } from "src/renderer/i18n";
import TextField from "src/renderer/components/ui/TextField";
import { t } from "@transifex/native";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { useStore } from "src/utils/useStore";
import { CSS } from "../stitches.config";
import Button from "src/renderer/components/ui/Button";
import { useActivation } from "src/utils/useActivation";

const transifexTags = "v2/missing-activation-view";

const SidebarStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  "& > * + *": {
    marginTop: 16,
  },
  height: "100%",
  marginBottom: 52,
};

function MissingActivationView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();
  const account = useStore("account");

  const { activated } = useActivation(false);

  const onSubmit = ({ activationKey }: { activationKey: string }) => {
    account.setActivationKey(activationKey!);
    history.push("/lobby");
  };

  useEffect(
    () => void (activated && history.push("/lobby")),
    [activated, history]
  );

  return (
    <Layout sidebar css={SidebarStyles}>
      <H1>
        <T _str="Retype your Activation Code" _tags={transifexTags} />
      </H1>
      <p>
        <T
          _str="The previously entered activation code is invalid or the activation code has not been entered yet."
          _tags={transifexTags}
        />
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t("Activation Code", { _tags: transifexTags })}
          invalid={errors.activationKey}
          {...register("activationKey", {
            required: true,
            pattern: /^[0-9a-f]+\/[0-9a-f]{40}$/,
          })}
        />
        <Button type="submit" variant="primary" centered>
          <T _str="Submit" _tags={transifexTags} />
        </Button>
      </form>
    </Layout>
  );
}

export default observer(MissingActivationView);
