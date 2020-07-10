import * as React from "react";

import { ipcRenderer } from "electron";
import { Button, ButtonProps } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

interface IClearCacheButtonProps extends ButtonProps {
  disabled?: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const [isCleared, setClearState] = React.useState(false);

  const handleClick = () => {
    const result = ipcRenderer.sendSync("clear cache");
    setClearState(result);
  };

  return (
    <Button
      {...props}
      startIcon={isCleared ? <CheckCircleIcon /> : <DeleteIcon />}
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
