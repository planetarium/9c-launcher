import React, { useReducer, useState } from "react";
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

const ButtonBar = styled("div", {
  display: "flex",
  "& > * + *": { marginLeft: 16 },
  justifyContent: "center",
});

interface ImportData {
  key?: string;
  fromFile?: boolean;
}

type Action = React.ChangeEvent<HTMLInputElement> | string;

function reducer(_: ImportData, action: Action): ImportData {
  if (typeof action === "string") {
    return { key: action, fromFile: true };
  } else {
    if (action.target.value.length === 0) return {};
    return { key: action.target.value, fromFile: false };
  }
}

function ImportView() {
  const [state, dispatch] = useReducer(reducer, {});

  return (
    <Layout sidebar>
      <H1>
        <T _str="Register Your Key" _tags={transifexTags} />
      </H1>
      <H2>
        <T
          _str="Register your backed up key file or key string."
          _tags={transifexTags}
        />
      </H2>
      <FileChooser
        disabled={!state.fromFile && state.fromFile != null}
        onDrop={(files) => files[0]?.text()?.then(dispatch)}
      />
      <TextField
        disabled={!!state.fromFile}
        onChange={dispatch}
        label={t("keystore", { _tags: transifexTags })}
      />
      <ButtonBar>
        <Button>
          <T _str="Prev" _tags={transifexTags} />
        </Button>
        <Button variant="primary" disabled={!state.key}>
          <T _str="Next" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </Layout>
  );
}

export default observer(ImportView);
