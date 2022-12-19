import React from "react";
import { observer } from "mobx-react";
import { isValidPrivateKey } from "@planetarium/account-raw";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";
import { T } from "src/renderer/i18n";
import H2 from "src/v2/components/ui/H2";
import TextField from "src/v2/components/ui/TextField";
import { t } from "@transifex/native";
import Button from "src/v2/components/ui/Button";
import { Link } from "src/v2/components/ui/Link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useStore } from "src/v2/utils/useStore";
import { useHistory } from "react-router";
import Form from "src/v2/components/ui/Form";

const transifexTags = "v2/ForgotPasswordView";

interface FormData {
  privateKey: string;
}

function ForgotPasswordView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const account = useStore("account");
  const history = useHistory();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    account.setPrivateKey(data.privateKey);
    history.push("/recover");
  };

  return (
    <Layout sidebar flex>
      <div>
        <H1>
          <T _str="Input your private key" _tags={transifexTags} />
        </H1>
        <H2>
          <T
            _str="Enter your private key to reset your password."
            _tags={transifexTags}
          />
        </H2>
      </div>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t("Private key", { _tags: transifexTags })}
          {...register("privateKey", {
            required: true,
            validate: (v) => isValidPrivateKey(v),
          })}
          invalid={!!errors.privateKey}
        />
        <Button css={{ marginTop: "auto" }} centered variant="primary">
          <T _str="OK" _tags={transifexTags} />
        </Button>
      </Form>
      <Link centered to="/revoke">
        <T _str="Got no keys?" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(ForgotPasswordView);
