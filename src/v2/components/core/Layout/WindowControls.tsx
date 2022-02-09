import React from "react";
import { styled } from "src/v2/stitches.config";

import MinimizeIcon from "@material-ui/icons/Minimize";
import CloseIcon from "@material-ui/icons/Close";

const currentWindow = require("electron").remote.getCurrentWindow();

const WindowControlsStyled = styled("div", {
  display: "flex",
  position: "fixed",
  right: 20,
  fontSize: "large",
  top: "1rem",
  justifyContent: "flex-end",
  dragable: false,
});

const WindowControlButton = styled("button", {
  all: "unset",
  display: "block",
  appearance: "none",
  flex: 1,
  marginLeft: "1rem",
});

export default function WindowControls() {
  return (
    <WindowControlsStyled>
      <WindowControlButton onClick={() => currentWindow.minimize()}>
        <MinimizeIcon fontSize="small" />
      </WindowControlButton>
      <WindowControlButton onClick={() => currentWindow.close()}>
        <CloseIcon fontSize="small" />
      </WindowControlButton>
    </WindowControlsStyled>
  );
}
