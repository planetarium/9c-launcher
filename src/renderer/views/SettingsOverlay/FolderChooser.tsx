import React, { useState } from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { dialog, getCurrentWindow } from "@electron/remote";
import {
  ActionableTextBoxWrapper,
  TextBox,
} from "src/renderer/components/ui/ActionableTextBox";
import { FolderOpen } from "@material-ui/icons";

type FolderChooserProps<T extends FieldValues = FieldValues> =
  UseControllerProps<T>;

export default function FolderChooser<T extends FieldValues = FieldValues>(
  props: FolderChooserProps<T>
) {
  const { field } = useController(props);
  const [value, setValue] = useState<string>(field.value);

  const onClick = async () => {
    const { filePaths } = await dialog.showOpenDialog(getCurrentWindow(), {
      properties: ["openDirectory"],
      defaultPath: field.value,
    });
    if (filePaths && filePaths.length > 0) {
      field.onChange(filePaths[0]);
      field.onBlur();
      setValue(filePaths[0]);
    }
  };

  return (
    <ActionableTextBoxWrapper onClick={onClick} tabIndex={0}>
      <TextBox>{value}</TextBox>
      <FolderOpen />
    </ActionableTextBoxWrapper>
  );
}
