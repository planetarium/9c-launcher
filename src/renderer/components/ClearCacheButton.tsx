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
    if (
      window.confirm("This will close launcher. Are you sure to clear cache?")
    ) {
      const result = ipcRenderer.sendSync("clear cache");
      setClearState(result);
    }
  };

  return (
    <Button
      {...props}
      startIcon={isCleared ? <CheckCircleIcon /> : <DeleteIcon />}
      disabled={props.disabled}
      onClick={() => handleClick()}
      color="default"
      variant="text"
    />
  );
};

export default ClearCacheButton;
