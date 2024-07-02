import React from "react";
import { observer } from "mobx-react";
import ProgressBar from "src/renderer/components/ProgressBar";
import { styled } from "src/renderer/stitches.config";
import Button from "src/renderer/components/ui/Button";

const StatusBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: 500,
});

const StatusMessage = styled("span", {
  marginBottom: 8,
  fontWeight: "bold",
  textShadow: "$text",
  lineHeight: 1,
  [`& > ${Button}`]: {
    marginLeft: 8,
  },
});

interface StatusBarProps {
  message: string;
  progress?: number;
  className?: string;
}

function StatusBar({ message, progress, className }: StatusBarProps) {
  return (
    <StatusBarStyled className={className}>
      <StatusMessage>{message}</StatusMessage>
      {!!progress && <ProgressBar percent={progress} />}
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
