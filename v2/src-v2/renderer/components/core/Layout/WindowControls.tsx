import React from "react";
import { styled } from "src/renderer/stitches.config";
import { ipcRenderer } from "electron";
import MinimizeIcon from "@material-ui/icons/Minimize";
import CloseIcon from "@material-ui/icons/Close";

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
  variants: {
    color: {
      black: {
        "& > svg": {
          fill: "black",
        },
      },
    },
  },
});

export default function WindowControls({ color }: { color?: "black" }) {
  return (
    <WindowControlsStyled>
      <WindowControlButton
        color={color}
        onClick={() => ipcRenderer.send("min")}
      >
        <MinimizeIcon fontSize="small" />
      </WindowControlButton>
      <WindowControlButton
        color={color}
        onClick={() => ipcRenderer.send("close")}
      >
        <CloseIcon fontSize="small" />
      </WindowControlButton>
    </WindowControlsStyled>
  );
}
