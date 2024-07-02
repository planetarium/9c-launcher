import React from "react";
import { styled } from "src/renderer/stitches.config";
import LinkIcon from "@material-ui/icons/Link";

const AdvancedActionBase = styled("button", {
  appearance: "none",
  background: "none",
  border: "none",
  color: "white",
  display: "block",
  "&>svg": {
    verticalAlign: "middle",
    marginRight: 8,
  },
  variants: {
    link: {
      true: {
        textDecoration: "underline",
      },
    },
  },
});

interface AdvancedActionProps {
  onClick: () => void;
  icon?: React.ReactNode;
  text: string;
  link?: boolean;
}

export default function AdvancedAction({
  onClick,
  icon = <LinkIcon />,
  text,
  link,
}: AdvancedActionProps) {
  return (
    <AdvancedActionBase onClick={onClick} link={link}>
      {icon}
      {text}
    </AdvancedActionBase>
  );
}
