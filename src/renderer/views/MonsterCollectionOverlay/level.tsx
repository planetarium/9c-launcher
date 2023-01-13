import React from "react";
import { AnimatePresence, LayoutGroup, Variants, motion } from "framer-motion";
import { styled } from "src/renderer/stitches.config";

import stepIcon from "src/renderer/resources/collection/icon-step.png";
import currentBackground from "src/renderer/resources/collection/current-status-round.png";
import currentLeaf from "src/renderer/resources/collection/current-status-leaf.gif";
import selectArrow from "src/renderer/resources/collection/select-arrow.gif";
import ncgIcon from "src/renderer/resources/ui-main-icon-gold.png";

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

const LevelItem = styled(motion.li, {
  all: "unset",
  display: "block",
  position: "relative",
  zIndex: 1,
  variants: {
    current: {
      true: {
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: "contain",
      },
    },
    disabled: {
      true: {
        filter: "brightness(0.5)",
      },
    },
  },
});

const LevelCaption = styled(motion.div, {
  boxShadow: "0px 0px 3px 3px rgba(0, 0, 0, 0.2)",
  borderRadius: "1em",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  color: "#fff",

  position: "absolute",
  top: "100%",
  left: "50%",
  // transform: "translateX(-50%)",
  width: "max-content",
  transition: "background-color 0.2s ease-in-out, font-size 0.2s ease-in-out",

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

const LevelIcon = styled(motion.img, {
  width: 118,
  height: 118,
});

const CurrentMarker = styled(motion.div, {
  width: 80,
  height: 40,
  backgroundImage: `url(${currentLeaf})`,
  backgroundSize: "contain",
  position: "absolute",
  top: -20,
  left: "calc(50% - 40px)",
});

const SelectionMarker = styled(motion.div, {
  width: 42,
  height: 45,
  backgroundImage: `url(${selectArrow})`,
  backgroundSize: "contain",
  position: "absolute",
  top: -20,
  left: "calc(50% - 21px)",
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
  selected?: boolean;
  /**
   * Whether if it's available to be chosen or not.
   * When it's unavailable, it's grayed out.
   */
  disabled?: boolean;
  onClick?(): void;
}

export const Level = ({
  amount,
  expandedImage,
  current,
  selected,
  disabled,
  onClick,
}: LevelProps) => (
  <LevelItem
    layout
    disabled={disabled}
    current={!!expandedImage && current}
    onClick={onClick}
  >
    <LayoutGroup id={String(amount)}>
      {expandedImage ? (
        <LevelIcon layoutId="icon" src={expandedImage} />
      ) : (
        <motion.img layoutId="icon" alt="" src={stepIcon} />
      )}
    </LayoutGroup>
    <LevelCaption
      layout="position"
      transformTemplate={(_, transform) => `translateX(-50%) ${transform}`}
      expanded={!!expandedImage}
    >
      <img src={ncgIcon} alt="NCG" /> {amount}
    </LevelCaption>
    {current && expandedImage && (
      <CurrentMarker
        data-chromatic="ignore"
        layout="position"
        layoutId="current-marker"
      />
    )}
    {selected && expandedImage && (
      <SelectionMarker
        data-chromatic="ignore"
        layout="position"
        layoutId="selection-marker"
      />
    )}
  </LevelItem>
);

export const Levels = ({ children }: { children: React.ReactNode }) => (
  <LevelContainer>
    {children}
    <LevelsLine />
  </LevelContainer>
);
