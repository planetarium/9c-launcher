import React, { MouseEvent } from "react";

import { InputAdornment, IconButton } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

interface VisibilityAdornmentProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  show: boolean;
}

const VisibilityAdornment: React.FC<VisibilityAdornmentProps> = ({
  onClick,
  show,
}) => (
  <InputAdornment position="end">
    <IconButton
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      edge="end"
    >
      {show ? <VisibilityOff /> : <Visibility />}
    </IconButton>
  </InputAdornment>
);

export default VisibilityAdornment;
