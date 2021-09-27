import React, { useState } from "react";
import { ipcRenderer, remote } from "electron";
import { Button, ButtonProps } from "@material-ui/core";
import { t } from "@transifex/native";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const { dialog } = remote;
const message = t("All local chain data will be deleted and re-downloaded again. This process can take up to 30 minutes. Are you sure to continue?");

interface IClearCacheButtonProps extends ButtonProps {
  disabled?: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const [isCleared, setClearState] = useState(false);

  const handleClick = async () => {
    const result = await dialog.showMessageBox({
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 1,
      cancelId: 1,
      message,
    });
    if (result.response === 0) {
      const result = ipcRenderer.sendSync("clear cache", true);
      setClearState(result);
    }
  };

  return (
    <Button
      color="default"
      variant="text"
      {...props}
      startIcon={isCleared ? <CheckCircleIcon /> : <DeleteIcon />}
      disabled={props.disabled}
      onClick={() => handleClick()}
    />
  );
};

export default ClearCacheButton;
