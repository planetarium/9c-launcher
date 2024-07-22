import { t } from "@transifex/native";
import React from "react";
// import FileChooser from "./ui/FileChooser";
import TextField from "./ui/TextField";
import FileChooser from "./ui/FileChooser";

export interface ImportData {
  key?: string;
  keyFile?: File;
  fromFile?: boolean;
}

type Action = React.ChangeEvent<HTMLInputElement> | string | File;

function make(action: Action): ImportData {
  if (typeof action === "string") {
    return { key: action, fromFile: false };
  } else if (action instanceof File) {
    return { keyFile: action, fromFile: true };
  } else {
    if (action.target.value.length === 0) return {};
    return { key: action.target.value, fromFile: false };
  }
}

const transifexTags = "v2/import-input";

export interface ImportInputProps {
  onSubmit: (key: ImportData) => void;
  fromFile?: boolean;
  invalid?: boolean;
}

export default function ImportInput({
  onSubmit,
  fromFile,
  invalid,
}: ImportInputProps) {
  return (
    <>
      {
        <FileChooser
          disabled={!fromFile && fromFile != null}
          onDrop={(files) => onSubmit(make(files[0]))}
        />
      }
      <TextField
        disabled={!!fromFile}
        onChange={(v) => onSubmit(make(v))}
        label={t("Private Key", { _tags: transifexTags })}
        invalid={invalid}
      />
    </>
  );
}
