import * as React from "react";

import { ipcRenderer } from "electron";
import { Button } from "@material-ui/core";

interface IClearCacheButtonProps {
  disabled: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const handleClick = () => {
    ipcRenderer.send("clear cache");
  };

  return (
    <Button
      disabled={props.disabled}
      onClick={() => handleClick()}
      variant="contained"
      color="secondary"
    >
      Clear Cache
    </Button>
  );
};

export default ClearCacheButton;
