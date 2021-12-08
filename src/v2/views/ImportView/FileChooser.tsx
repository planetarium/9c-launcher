import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { styled } from "src/v2/stitches.config";
import CloudUploadIcon from "@material-ui/icons/CloudUploadOutlined";

const ChooserWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  border: "2px dashed #979797",
});

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
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop the key file, or Browse</p>
      )}
    </ChooserWrapper>
  );
}
