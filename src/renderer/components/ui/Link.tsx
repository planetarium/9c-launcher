import { shell } from "electron";
import React, { ComponentProps } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import { styled } from "src/renderer/stitches.config";

export const Link = styled(ReactRouterLink, {
  color: "#888888",
  cursor: "pointer",
  variants: {
    centered: {
      true: {
        textAlign: "center",
      },
    },
  },
});

const BasicLink = styled("a", {
  color: "#888888",
  cursor: "pointer",
  variants: {
    centered: {
      true: {
        textAlign: "center",
      },
    },
  },
});

export function ExtLink({ ...props }: ComponentProps<typeof BasicLink>) {
  return (
    <BasicLink
      {...props}
      href="#"
      onClick={(e) => {
        e.preventDefault();
        props.href && shell.openExternal(props.href);
        return false;
      }}
    />
  );
}
