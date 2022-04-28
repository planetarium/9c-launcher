import OverlayBase from "src/v2/components/core/OverlayBase";
import { createTheme, styled } from "src/v2/stitches.config";

import background from "src/v2/resources/collection/bg.png";
import formImg from "src/v2/resources/collection/deposit-bg.png";
import buttonImg from "src/v2/resources/collection/button-activation.png";

export const theme = createTheme({
  colors: {
    primary: "#73452e",
    depositTitle: "#e3ad67",
    depositContent: "#fff6b9",
    depositButton: "#38261a",
  },
  gradients: {
    background: "linear-gradient(to top, #9e6a37, #d7a55e, #a36e3a)",
  },
  images: {
    background: `url(${background})`,
    deposit: `url(${formImg})`,
    depositButton: `url(${buttonImg})`,
  },
  shadows: {
    embossed: "0.5px 0.9px 0 #fdd6a0",
    standard: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  },
});

export const MonsterCollectionOverlayBase = styled(OverlayBase, {
  "&&": {
    width: "1166px",
    height: "708px",
    backgroundImage: theme.images.background,
    padding: 36,
    marginTop: "30px", // (768 - 708) / 2
  },
});

export const RewardSheetContent = styled("section", {
  display: "grid",
  gridAutoColumns: "auto",
  gridAutoFlow: "column",
  gridTemplateRows: "1rem 1fr",
  gridRowGap: "9px",

  borderStyle: "solid",
  borderWidth: "5px",
  borderImageSource: theme.gradients.background,
  borderImageSlice: "1",

  backgroundColor: theme.colors.primary,
});

export const Title = styled("img", {
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
});

export const DepositForm = styled("form", {
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "118px 1fr 118px",
  gridTemplateRows: "30px 1fr",
  backgroundImage: theme.images.deposit,
  backgroundOrigin: "border-box",
  width: 628,
  height: 153,
  marginLeft: "auto",
  marginRight: "auto",
  padding: 10,
});

export const DepositTitle = styled("h1", {
  gridColumn: 2,
  gridRow: 1,
  justifySelf: "center",
  alignSelf: "baseline",
  fontSize: 20,
  fontWeight: "$bold",
  color: theme.colors.depositTitle,
});

export const DepositContent = styled("div", {
  gridColumn: 2,
  gridRow: 2,
  justifySelf: "center",
  alignSelf: "center",
  fontSize: 60,
  fontWeight: "$bold",
  color: theme.colors.depositContent,
  "& > sub": {
    fontSize: 30,
    bottom: 0,
  },
});

export const DepositButton2 = styled("button", {
  appearance: "none",
  border: "none",
  backgroundColor: "transparent",

  backgroundImage: theme.images.depositButton,
  borderRadius: "50%",
  color: theme.colors.depositButton,

  gridColumn: 3,
  gridRow: "1 / span 2",
  justifySelf: "center",
  alignSelf: "center",

  width: 118,
  height: 118,
  fontWeight: "$bold",
  fontSize: 24,
  textShadow: theme.shadows.embossed,

  position: "relative",
  top: -3,
  right: 3,
});
