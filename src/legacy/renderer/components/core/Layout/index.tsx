import React from "react";
import { observer } from "mobx-react";

import WindowControls from "./WindowControls";
import Menu from "../Menu";
import StatusBar from "./StatusBar";

import InfoText from "./InfoText";
import { CSS, styled } from "src/renderer/stitches.config";
import background from "src/renderer/resources/launcher-png.png";
import UserInfo from "./UserInfo";
import { Toaster } from "react-hot-toast";

interface LayoutProps {
  sidebar?: boolean;
  flex?: boolean;
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
  boxSizing: "border-box",
  padding: 52,
  "& > * + *": { marginTop: 16 },
  "& > *": { dragable: false },
  paddingBottom: 104,
  variants: {
    flex: {
      true: {
        display: "flex",
        flexDirection: "column",
      },
    },
  },
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

function Layout({
  children,
  sidebar,
  ...sidebarProps
}: React.PropsWithChildren<LayoutProps>) {
  return (
    <Background>
      <Toaster
        toastOptions={{
          style: {
            maxWidth: "1000px",
          },
        }}
      />
      {sidebar ? <Sidebar {...sidebarProps}>{children}</Sidebar> : <UserInfo />}
      <BottomControls>
        <StatusBar />
        <Menu />
      </BottomControls>
      <InfoText />
      {process.platform === "win32" && <WindowControls />}
    </Background>
  );
}

export default observer(Layout);
