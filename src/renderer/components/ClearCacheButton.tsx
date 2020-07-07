import * as React from "react";

import { ipcRenderer } from "electron";
import { Button, ButtonProps } from "@material-ui/core";

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
      disabled={props.disabled}
      onClick={() => handleClick()}
      color="default"
    >
      Clear Cache
    </Button>
  );
};

export default ClearCacheButton;
