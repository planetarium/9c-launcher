import React from "react";
import { observer } from "mobx-react";
import Layout from "src/v2/components/core/Layout";
import { T } from "src/renderer/i18n";
import H1 from "src/v2/components/ui/H1";
import TextField from "src/v2/components/ui/TextField";
import { t } from "@transifex/native";
import FileChooser from "./FileChooser";
import Button from "src/v2/components/ui/Button";
import H2 from "src/v2/components/ui/H2";
import { styled } from "src/v2/stitches.config";

const transifexTags = "v2/import-view";

const importViewStyles = {
  boxSizing: "border-box",
  padding: 52,
  "& > * + *": { marginTop: 32 },
  height: "100%",
  marginBottom: 62,
};

const ButtonBar = styled("div", {
  display: "flex",
  "& > * + *": { marginLeft: 16 },
  justifyContent: "center",
});

function ImportView() {
  return (
    <Layout sidebar css={importViewStyles}>
      <H1>
        <T _str="Register Your Key" _tags={transifexTags} />
      </H1>
      <H2>
        <T
          _str="Register your backed up key file or key string."
          _tags={transifexTags}
        />
      </H2>
      <FileChooser />
      <TextField label={t("keystore", { _tags: transifexTags })} />
      <ButtonBar>
        <Button>
          <T _str="Prev" _tags={transifexTags} />
        </Button>
        <Button>
          <T _str="Next" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </Layout>
  );
}

export default observer(ImportView);
