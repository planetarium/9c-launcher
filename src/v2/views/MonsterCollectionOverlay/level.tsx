import React from "react";
import { theme } from "./base";
import { styled } from "src/v2/stitches.config";

import stepIcon from "src/v2/resources/collection/icon-step.png";
import ncgIcon from "src/v2/resources/ui-main-icon-gold.png";

const LevelsLine = styled("div", {
  width: 800,
  height: 6,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  border: "1px solid black",
  position: "absolute",
  top: "calc(50% - 5px)",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const LevelContainer = styled("ol", {
  all: "unset",
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: 820,
  marginTop: "auto",
});

const LevelItem = styled("li", {
  all: "unset",
  display: "block",
  position: "relative",
  zIndex: 1,
});

const LevelCaption = styled("div", {
  boxShadow: "0px 0px 3px 3px rgba(0, 0, 0, 0.2)",
  borderRadius: "1em",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  color: "#fff",

  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "max-content",

  "> img": {
    height: "1em",
    verticalAlign: "middle",
  },

  variants: {
    expanded: {
      true: {
        top: "unset",
        bottom: 0,
        fontSize: 21,
        height: 30,
        borderRadius: 15,
        lineHeight: "30px",
        padding: "0 1em",
        backgroundColor: "#402419",
      },
    },
  },
});

const LevelIcon = styled("img", {
  width: 118,
  height: 118,
});

interface LevelProps {
  amount: number;
  /**
   * When provided, shows the expanded level UI.
   * **If the level isn't expanded the `current` and `chosen` props are no-op.**
   */
  expandedImage?: string;
  /**
   * Whether if this is the user's current level or not.
   */
  current?: boolean;
  /**
   * Whether if this is the user's chosen level or not.
   * It is meant to be used on editing.
   */
  chosen?: boolean;
}

export const Level = ({ amount, expandedImage }: LevelProps) => (
  <LevelItem>
    {expandedImage ? <LevelIcon src={expandedImage} /> : <img src={stepIcon} />}
    <LevelCaption expanded={!!expandedImage}>
      <img src={ncgIcon} /> {amount}
    </LevelCaption>
  </LevelItem>
);

export const Levels = ({ children }: { children: React.ReactNode }) => (
  <LevelContainer>
    {children}
    <LevelsLine />
  </LevelContainer>
);
