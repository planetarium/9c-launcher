import { styled } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const TextButton = styled(Button)({
  all: "unset",
  cursor: "pointer",
  fontSize: "inherit",
  "& .MuiTouchRipple-root": {
    display: "none",
  },
});

export default TextButton;
