import { CSS } from "src/renderer/stitches.config";
import ActivationFailView from "./ActivationFailView";
import GetPatronView from "./GetPatronView";
import ActivationSuccessView from "./ActivationSuccessView";
import ActivationWaitView from "./ActivationWaitView";
import CreateKeyView from "./CreateKeyView";

const registerStyles: CSS = {
  display: "flex",
  flexDirection: "column",
  padding: 52,
  boxSizing: "border-box",
  "& > * + *": {
    marginTop: "1rem",
  },
};

export {
  ActivationFailView,
  ActivationSuccessView,
  ActivationWaitView,
  CreateKeyView,
  GetPatronView,
  registerStyles,
};
