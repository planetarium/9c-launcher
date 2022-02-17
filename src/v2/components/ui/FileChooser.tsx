import React from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { styled } from "src/v2/stitches.config";
import CloudUploadIcon from "@material-ui/icons/CloudUploadOutlined";
import { T } from "src/renderer/i18n";

const ChooserWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  border: "2px dashed #979797",
  variants: {
    rejected: {
      true: {
        border: "2px dashed #ffa8a8",
        color: "#ff6b6b",
      },
    },
  },
});

const transifexTags = "v2/FileChooser";

interface FileChooserProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onDrop?: DropzoneOptions["onDrop"];
  validator?: DropzoneOptions["validator"];
  disabled?: boolean;
}

export default function FileChooser({
  onChange,
  onBlur,
  onDrop,
  validator,
  disabled,
}: FileChooserProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({ onDrop, disabled, multiple: false, validator });

  return (
    <ChooserWrapper {...getRootProps()} rejected={!!fileRejections[0]}>
      <input {...getInputProps({ onChange, onBlur })} />
      <CloudUploadIcon fontSize="large" />
      {acceptedFiles.length > 0 ? (
        <p>{acceptedFiles[0].name}</p>
      ) : fileRejections[0] && fileRejections[0].errors[0] ? (
        <p>{fileRejections[0].errors[0].message}</p>
      ) : isDragActive ? (
        <p>
          <T _str="Drop the files here ..." _tags={transifexTags} />
        </p>
      ) : (
        <p>
          <T
            _str="Drag and drop the key file, or Browse"
            _tags={transifexTags}
          />
        </p>
      )}
    </ChooserWrapper>
  );
}
