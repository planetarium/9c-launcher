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
  top: 16,
  left: "50%",
  transform: "translateX(-50%)",
});

const LevelContainer = styled("ol", {
  all: "unset",
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
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
});

interface LevelProps {
  amount: number;
}

export const Level = ({ amount }: LevelProps) => (
  <LevelItem>
    <img src={stepIcon} />
    <LevelCaption>
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
