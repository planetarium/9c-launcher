import { t } from "@transifex/native";
import React from "react";
import { DropzoneOptions } from "react-dropzone";
import FileChooser from "./ui/FileChooser";
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
  fileValidator?: DropzoneOptions["validator"];
}

export default function ImportInput({
  onSubmit,
  fromFile,
  fileValidator,
}: ImportInputProps) {
  return (
    <>
      <FileChooser
        disabled={!fromFile && fromFile != null}
        onDrop={(files) => files[0]?.text()?.then((v) => onSubmit(make(v)))}
        validator={fileValidator}
      />
      <TextField
        disabled={!!fromFile}
        onChange={(v) => onSubmit(make(v))}
        label={t("keystore", { _tags: transifexTags })}
      />
    </>
  );
}
