import React from "react";
import { observer } from "mobx-react";
import ProgressBar from "src/v2/components/ProgressBar";
import { styled } from "src/v2/stitches.config";
import Button from "src/v2/components/ui/Button";

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
}

function StatusBar({ message, progress }: StatusBarProps) {
  return (
    <StatusBarStyled>
      <StatusMessage>{message}</StatusMessage>
      {!!progress && <ProgressBar percent={progress} />}
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
