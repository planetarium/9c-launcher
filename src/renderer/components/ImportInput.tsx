import { t } from "@transifex/native";
import React from "react";
// import FileChooser from "./ui/FileChooser";
import TextField from "./ui/TextField";
import FileChooser from "./ui/FileChooser";

export interface ImportData {
  key?: string;
  keyFile?: File;
}

type Action = React.ChangeEvent<HTMLInputElement> | string | File;

function make(action: Action): ImportData {
  if (typeof action === "string") {
    return { key: action };
  } else if (action instanceof File) {
    return { keyFile: action };
  } else {
    if (action.target.value.length === 0) return {};
    return { key: action.target.value };
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
      />
    </>
  );
}
