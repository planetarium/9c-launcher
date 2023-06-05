import { CSS } from "src/renderer/stitches.config";
import ActivationFailView from "./ActivationFailView";
import ActivationCodeView from "./ActivationCodeView";
import ActivationSuccessView from "./ActivationSuccessView";
import ActivationWaitView from "./ActivationWaitView";
import CreateKeyView from "./CreateKeyView";

const registerStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  "& > * + *": {
    marginTop: "1rem",
  },
};

export {
  ActivationFailView,
  ActivationCodeView,
  ActivationSuccessView,
  ActivationWaitView,
  CreateKeyView,
  registerStyles,
};
