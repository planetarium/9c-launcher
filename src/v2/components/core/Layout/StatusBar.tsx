import React from "react";
import { observer } from "mobx-react";
import ProgressBar from "./ProgressBar";
import { styled } from "src/v2/stitches.config";

const StatusBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: 500,
});

const StatusMessage = styled("span", {
  marginBottom: 8,
  fontWeight: "bold",
  textShadow: "$text",
});

function StatusBar() {
  // TODO: Implement status fetcher
  return (
    <StatusBarStyled>
      <StatusMessage>Executing Actions.. (8/8) 37% 1130</StatusMessage>
      <ProgressBar percent={40} />
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
