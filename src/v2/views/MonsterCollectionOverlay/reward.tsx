import React from "react";
import { theme } from "./base";
import { styled } from "src/v2/stitches.config";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { motion } from "framer-motion";

const ScrollArea = styled(motion(ScrollAreaPrimitive.ScrollArea), {
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
    alignItems: "strech",
  },
  "& > * + *": {
    marginLeft: 20,
  },
});

const Scrollbar = styled(ScrollAreaPrimitive.Scrollbar, {
  display: "flex",
  flexDirection: "column",
  height: 4,
  backgroundColor: "#42291f",
  margin: "4px 10px",
  justifyContent: "center",
});

const Thumb = styled(ScrollAreaPrimitive.Thumb, {
  flex: 1,
  minHeight: 8,
  backgroundColor: "#bf8f53",
  borderTop: "1px solid #f3b36b",
  borderRadius: 4,
});

const Spacer = styled("div", {
  width: 50,
  flexShrink: 0,
});

export const RewardSheet = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea
    initial={{ opacity: 0, y: "100%" }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: "100%" }}
  >
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

export const RewardSheetPlaceholder = styled(motion.div, {
  height: 250,
  marginTop: "auto",
});

const ItemGroupStyled = styled("section", {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  "& + &": {
    marginLeft: 40,
  },
  "& + &::before": {
    position: "absolute",
    left: -40,
    display: "block",
    content: "''",
    boxSizing: "border-box",
    height: "100%",
    border: "2px groove #9f6b4b",
    margin: "0 20px",
  },
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
  marginTop: 2,
  color: theme.colors.title,
});

const ItemContainer = styled("div", {
  display: "flex",
  flex: 1,
  padding: 10,
  backgroundColor: "#321a13",
  boxShadow: "inset 0px 3px 7px 0 rgba(0, 0, 0, 0.7)",
  borderRadius: 10,
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

const ItemFrame = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: 94,
  height: 94,
  backgroundImage: theme.images.itemBg,
  "> img": {
    display: "block",
  },
  variants: {
    received: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

const ItemTitle = styled("h2", {
  color: "#9f6b4b",
  fontSize: "1rem",
  lineHeight: 1,
  textAlign: "center",
  border: "none",
  margin: 10,
  variants: {
    received: {
      true: {
        opacity: 0.5,
      },
    },
  },
});

const ItemAmount = styled("div", {
  color: "#fff5e3",
  textShadow: theme.shadows.standard,
  WebKitTextStroke: "1px solid black",
});

interface ItemProps {
  children: React.ReactNode;
  title: React.ReactNode;
  amount: string | number;
  received?: boolean;
  tooltip?: React.ReactNode;
}

export const Item = ({ children, title, amount, tooltip }: ItemProps) => (
  <div>
    <ItemFrame>
      {children}
      <ItemAmount>{amount}</ItemAmount>
    </ItemFrame>
    <ItemTitle>{title}</ItemTitle>
  </div>
);
