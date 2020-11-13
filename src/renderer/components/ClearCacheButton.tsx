import React, { useState } from "react";
import { ipcRenderer } from "electron";
import { Button, ButtonProps } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

interface IClearCacheButtonProps extends ButtonProps {
  disabled?: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const [isCleared, setClearState] = useState(false);

  const handleClick = () => {
    if (window.confirm("Are you sure you want to clear cache?")) {
      const result = ipcRenderer.sendSync("clear cache");
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
