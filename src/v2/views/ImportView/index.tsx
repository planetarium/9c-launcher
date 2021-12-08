import React from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import { T } from "src/renderer/i18n";
import H1 from "src/v2/components/ui/H1";
import TextField from "src/v2/components/ui/TextField";
import { t } from "@transifex/native";
import FileChooser from "./FileChooser";
import Button from "src/v2/components/ui/Button";

const transifexTags = "v2/import-view";

const importViewStyles = {
  boxSizing: "border-box",
  padding: 52,
  "& > * + *": { marginTop: 16 },
  height: "100%",
  marginBottom: 62,
};

function ImportView() {
  return (
    <Layout sidebar css={importViewStyles}>
      <H1>
        <T _str="Register Your Key" _tags={transifexTags} />
      </H1>
      <FileChooser />
      <TextField label={t("keystore", { _tags: transifexTags })} />
      <Button>Prev</Button>
      <Button>Next</Button>
    </Layout>
  );
}

export default observer(ImportView);
