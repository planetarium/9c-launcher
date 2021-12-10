import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
});

const transifexTags = "v2/FileChooser";

export default function FileChooser() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <ChooserWrapper {...getRootProps()}>
      <input {...getInputProps()} />
      <CloudUploadIcon fontSize="large" />
      {isDragActive ? (
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
