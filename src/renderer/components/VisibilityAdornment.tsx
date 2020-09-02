import React from "react";

import { InputAdornment, IconButton } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import { ClickEvent } from "../../types/events";

interface VisibilityAdornmentProps {
  onClick: (e: ClickEvent) => void;
  show: boolean;
}

const VisibilityAdornment: React.FC<VisibilityAdornmentProps> = (props) => (
  <InputAdornment position="end">
    <IconButton
      onClick={props.onClick}
      onMouseDown={(e) => e.preventDefault()}
      edge="end"
    >
      {props.show ? <VisibilityOff /> : <Visibility />}
    </IconButton>
  </InputAdornment>
);

export default VisibilityAdornment;
