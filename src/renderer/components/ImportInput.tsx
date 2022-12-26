import { t } from "@transifex/native";
import React from "react";
// import FileChooser from "./ui/FileChooser";
import TextField from "./ui/TextField";

export interface ImportData {
  key?: string;
  fromFile?: boolean;
}

type Action = React.ChangeEvent<HTMLInputElement> | string;

function make(action: Action): ImportData {
  if (typeof action === "string") {
    return { key: action, fromFile: true };
  } else {
    if (action.target.value.length === 0) return {};
    return { key: action.target.value, fromFile: false };
  }
}

const transifexTags = "v2/import-input";

export interface ImportInputProps {
  onSubmit: (key: ImportData) => void;
  fromFile?: boolean;
}

export default function ImportInput({ onSubmit, fromFile }: ImportInputProps) {
  return (
    <>
      {/* <FileChooser
        disabled={!fromFile && fromFile != null}
        onDrop={(files) => files[0]?.text()?.then((v) => onSubmit(make(v)))}
      /> */}
      <TextField
        disabled={!!fromFile}
        onChange={(v) => onSubmit(make(v))}
        label={t("Private key", { _tags: transifexTags })}
      />
    </>
  );
}
