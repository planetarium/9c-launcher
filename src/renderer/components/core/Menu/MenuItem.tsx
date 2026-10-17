import React from "react";
import { styled } from "src/renderer/stitches.config";
import type * as Stitches from "@stitches/react";

const MenuItemContainer = styled("button", {
  all: "unset",
  display: "flex",
  alignItems: "center",
  width: 160,
  padding: "10px",
  appearance: "none",
  cursor: "pointer",
  "& img": {
    paddingRight: "1rem",
  },
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    outline: "none",
  },
  "&:disabled": {
    opacity: 0.8,
  },
});

interface MenuItemProps
  extends Stitches.VariantProps<typeof MenuItemContainer> {
  onClick: () => void;
  icon: string;
  text: string;
  disabled?: boolean;
}

export default function MenuItem({
  onClick,
  icon,
  text,
  disabled,
  ...props
}: MenuItemProps) {
  return (
    <MenuItemContainer onClick={onClick} disabled={disabled} {...props}>
      <img alt="" src={icon} />
      <span>{text}</span>
    </MenuItemContainer>
  );
}
