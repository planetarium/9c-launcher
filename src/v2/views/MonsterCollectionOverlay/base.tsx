import OverlayBase from "src/v2/components/core/OverlayBase";
import { createTheme, styled } from "src/v2/stitches.config";

import background from "src/v2/resources/collection/bg.png";
import formImg from "src/v2/resources/collection/deposit-bg.png";
import buttonImg from "src/v2/resources/collection/button-activation.png";
import rewardImg from "src/v2/resources/collection/reward-bg.png";
import dotImg from "src/v2/resources/collection/dot.png";
import darkTextBg from "src/v2/resources/collection/dark-text-bg.png";
import itemBg from "src/v2/resources/collection/item-bg.png";

export const theme = {
  colors: {
    primary: "#73452e",
    depositTitle: "#e3ad67",
    depositContent: "#fff6b9",
    depositButton: "#38261a",
    title: "#fbdeb8",
  },
  gradients: {
    background: "linear-gradient(to top, #9e6a37, #d7a55e, #a36e3a)",
  },
  images: {
    background: `url(${background})`,
    deposit: `url(${formImg})`,
    depositButton: `url(${buttonImg})`,
    reward: `url(${rewardImg})`,
    dot: `url(${dotImg})`,
    darkTextBg: `url(${darkTextBg})`,
    itemBg: `url(${itemBg})`,
  },
  shadows: {
    embossed: "0.5px 0.9px 0 #fdd6a0",
    standard: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  },
} as const;

export const MonsterCollectionOverlayBase = styled(OverlayBase, {
  "&&": {
    width: "1166px",
    height: "708px",
    backgroundImage: theme.images.background,
    padding: 36,
    paddingBottom: 0,
    marginTop: "30px", // (768 - 708) / 2
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: -2,
  },
});

export const Title = styled("img", {
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
});

export const DepositHolder = styled("div", {
  width: 966,
  backgroundImage: theme.images.darkTextBg,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "bottom center",
});

export const DepositDescription = styled("p", {
  color: "White",
  textShadow: theme.shadows.standard,
  fontSize: 18,
  lineHeight: 1.5,
  textAlign: "center",
  "::last-child": {
    marginBottom: 20,
  },
  variants: {
    warning: {
      true: {
        color: "#ff4343",
      },
    },
  },
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
