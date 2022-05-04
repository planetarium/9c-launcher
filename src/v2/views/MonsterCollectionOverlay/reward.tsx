import React from "react";
import { theme } from "./base";
import { styled } from "src/v2/stitches.config";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

const ScrollArea = styled(ScrollAreaPrimitive.ScrollArea, {
  backgroundImage: theme.images.reward,
  backgroundSize: "cover",
  backgroundOrigin: "border-box",
  width: 1124,
  height: 250,
  boxSizing: "border-box",
  paddingTop: 40,
  paddingLeft: 40,
  paddingRight: 40,
  marginTop: "auto",
});

const Viewport = styled(ScrollAreaPrimitive.Viewport, {
  width: "100%",
  height: "100%",
  WebkitMaskImage:
    "-webkit-linear-gradient(0deg, transparent 0%, black 5%, black 95%, transparent 100%)",
  "> div[style]": {
    display: "flex !important",
  },
  "& > * + *": {
    marginLeft: 20,
  },
});

const Scrollbar = styled(ScrollAreaPrimitive.Scrollbar, {
  display: "flex",
  flexDirection: "column",
  height: 8,
  backgroundColor: "#42291f",
  marginBottom: 10,
  marginLeft: 40,
  marginRight: 40,
});

const Thumb = styled(ScrollAreaPrimitive.Thumb, {
  flex: 1,
  backgroundColor: "#bf8f53",
});

const Spacer = styled("div", {
  width: 50,
  flexShrink: 0,
});

export const RewardSheet = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea>
    <Viewport>
      <Spacer />
      {children}
      <Spacer />
    </Viewport>
    <Scrollbar orientation="horizontal">
      <Thumb />
    </Scrollbar>
  </ScrollArea>
);

const ItemGroupStyled = styled("section", {
  display: "flex",
  flexDirection: "column",
  height: 180,
});

const Title = styled("h1", {
  "&::before": {
    content: "''",
    width: 9,
    height: 9,
    backgroundImage: theme.images.dot,
    display: "inline-block",
    marginRight: 5,
  },
  fontSize: "1rem",
  color: theme.colors.title,
});

const ItemContainer = styled("div", {
  display: "flex",
  flex: 1,
  padding: 10,
  backgroundColor: "#321a13",
  boxShadow: "inset 0px 3px 7px 0 rgba(0, 0, 0, 0.7)",
  borderRadius: 5,
});

interface ItemGroupProps {
  children: React.ReactNode;
  title: string;
}

export const ItemGroup = ({ children, title }: ItemGroupProps) => (
  <ItemGroupStyled>
    <Title>{title}</Title>
    <ItemContainer>{children}</ItemContainer>
  </ItemGroupStyled>
);
