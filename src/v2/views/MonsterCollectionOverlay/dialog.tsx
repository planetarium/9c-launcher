import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogLabel,
} from "@reach/alert-dialog";
import { styled } from "src/v2/stitches.config";

import dialogBackground from "src/v2/resources/collection/popup.png";
import primaryButton from "src/v2/resources/collection/button-ok.png";
import primaryButtonHover from "src/v2/resources/collection/button-ok-over.png";
import secondaryButton from "src/v2/resources/collection/button-cancel-2.png";
import secondaryButtonHover from "src/v2/resources/collection/button-cancel-2-over.png";

export const Alert = styled(AlertDialog, {
  "&&": {
    width: 528,
    height: 333,
    padding: "2rem",
    boxSizing: "border-box",
    backgroundImage: `url(${dialogBackground})`,
    backgroundColor: "transparent",
    fontFamily: "Montserrat",

    display: "flex",
    flexDirection: "column",
  },
});

export const AlertHeader = styled("header", {
  height: "80px",
  "> img": {
    display: "block",
    margin: "-20px auto -10px",
  },
});

export const AlertTitle = styled(AlertDialogLabel, {
  color: "#fefebf",
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 20,
});

export const AlertDescription = styled(AlertDialogDescription, {
  marginTop: "auto",
  color: "#ebceb1",
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  textAlign: "center",
  fontSize: 18,
});

export const AlertButtonBar = styled("div", {
  marginTop: "auto",
  textAlign: "center",
});

export const AlertButton = styled("button", {
  appearance: "none",
  all: "unset",
  width: 208,
  height: 58,
  backgroundImage: `url(${secondaryButton})`,
  transition: "background-image 0.2s ease-in-out",
  textAlign: "center",
  fontSize: 24,
  fontWeight: "bold",
  color: "#e3ad67",

  "&:hover": {
    backgroundImage: `url(${secondaryButtonHover})`,
  },

  variants: {
    variant: {
      primary: {
        backgroundImage: `url(${primaryButton})`,
        color: "#38261a",
        "&:hover": {
          backgroundImage: `url(${primaryButtonHover})`,
        },
      },
    },
  },
});
