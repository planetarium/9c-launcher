import React from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import H1 from "src/v2/components/ui/H1";
import { T } from "src/renderer/i18n";
import H2 from "src/v2/components/ui/H2";
import TextField from "src/v2/components/ui/TextField";
import { t } from "@transifex/native";
import Button from "src/v2/components/ui/Button";
import { Link } from "src/v2/components/ui/Link";

const transifexTags = "v2/ForgotPasswordView";

function ForgotPasswordView() {
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

      <TextField label={t("Private key", { _tags: transifexTags })} />

      <Button css={{ marginTop: "auto" }} centered variant="primary">
        <T _str="OK" _tags={transifexTags} />
      </Button>
      <Link centered to="/revoke">
        <T _str="Got no keys?" _tags={transifexTags} />
      </Link>
    </Layout>
  );
}

export default observer(ForgotPasswordView);
