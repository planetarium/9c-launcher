import React, { useMemo } from "react";
import { observer } from "mobx-react";
import { useStore } from "../../../utils/useStore";

import WindowControls from "./WindowControls";
import Menu from "../Menu";
import StatusBar from "./StatusBar";

import SettingsOverlay from "../../../views/SettingsOverlay";
import StakingOverlay from "../../../views/StakingOverlay";
import InfoText from "./InfoText";
import { AnimatePresence, motion } from "framer-motion";
import { CSS, styled } from "src/v2/stitches.config";
import background from "../../../resources/launcher-png.png";
import OnboardingOverlay from "src/v2/views/OnboardingOverlay";
import UserInfo from "./UserInfo";

interface LayoutProps {
  sidebar?: boolean;
  css?: CSS;
}

const Background = styled("div", {
  backgroundImage: `url(${background})`,
  height: "100%",
  width: "100%",
  dragable: true,
});

const Sidebar = styled("main", {
  position: "fixed",
  left: 0,
  top: 0,
  width: 560,
  height: "100%",
  backgroundColor: "$gray",
  opacity: 0.95,
  dragable: false,
});

const BottomControls = styled("aside", {
  display: "flex",
  position: "fixed",
  right: "40px",
  bottom: "45px",
  justifyContent: "flex-end",
  alignItems: "flex-end",
  dragable: false,
});

const OverlayContainer = styled(motion.div, {
  position: "fixed",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "$gray80",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  dragable: false,
});

function Layout({
  children,
  sidebar,
  css,
}: React.PropsWithChildren<LayoutProps>) {
  return (
    <Background>
      {sidebar ? <Sidebar css={css}>{children}</Sidebar> : <UserInfo />}
      <BottomControls>
        <StatusBar />
        <Menu />
      </BottomControls>
      <InfoText />
      <WindowControls />
    </Background>
  );
}

export default observer(Layout);
