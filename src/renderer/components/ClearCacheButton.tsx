import * as React from "react";

import { ipcRenderer } from "electron";
import { Button, ButtonProps } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

interface IClearCacheButtonProps extends ButtonProps {
  disabled?: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const handleClick = () => {
    ipcRenderer.send("clear cache");
  };

  return (
    <Button
      {...props}
      startIcon={<DeleteIcon />}
      disabled={props.disabled}
      onClick={() => handleClick()}
      color="default"
      variant="text"
    >
      Clear Cache
    </Button>
  );
};

export default ClearCacheButton;
