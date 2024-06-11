import { CSS } from "src/renderer/stitches.config";
import PledgeFailView from "./PledgeFailView";
import GetPatronView from "./GetPatronView";
import PledgeSuccessView from "./PledgeSuccessView";
import PledgeWaitView from "./PledgeWaitView";
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
  PledgeFailView,
  PledgeSuccessView,
  PledgeWaitView,
  CreateKeyView,
  GetPatronView,
  registerStyles,
};
