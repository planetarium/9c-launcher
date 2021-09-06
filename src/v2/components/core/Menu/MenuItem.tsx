import React from "react";
import { styled } from "src/v2/stitches.config";
import type * as Stitches from "@stitches/react";

const MenuItemContainer = styled("div", {
  display: "flex",
  alignItems: "center",
  padding: "10px",
  "& img": {
    paddingRight: "1rem",
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.8,
      },
    },
  },
});

interface MenuItemProps
  extends Stitches.VariantProps<typeof MenuItemContainer> {
  onClick: () => void;
  icon: string;
  text: string;
}

export default function MenuItem({
  onClick,
  icon,
  text,
  ...props
}: MenuItemProps) {
  return (
    <MenuItemContainer onClick={onClick} {...props}>
      <img alt="" src={icon} />
      <span>{text}</span>
    </MenuItemContainer>
  );
}
