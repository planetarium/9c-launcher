import { styled, Box, Button, Backdrop } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import OverlayBase, { CloseButton } from "../../OverlayBase";
import Text from "src/renderer/components/ui/Text";
import H1 from "src/renderer/components/ui/H1";
import { OverlayProps } from "src/utils/types";

const MainPageContainer = styled(OverlayBase)({
  "&&": {
    width: "520px",
    height: "auto",
    backgroundColor: "#1d1e1f",
    padding: "2rem",
    margin: "10vh auto",
    display: "flex",
    gap: "0.5rem",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  },
});

const SquareBox = {
  borderRadius: "1rem",
  aspectRatio: "1/1",
  minWidth: "100%",

  display: "flex",
  justifyContent: "center",
  overflow: "hidden",
};

export function NoticeOverlay({ isOpen, onClose }: OverlayProps) {
  return (
    <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
      <CloseButton
        onClick={() => {
          onClose();
        }}
      />
      <H1 css={{ margin: 0 }}>Notice Regarding Launcher Update</H1>
      <Box marginBottom={0}>
        <Text css={{ fontWeight: "bold", fontSize: "18px" }}>
          Monster Collection is still available in the game!
        </Text>
        <Text>
          Starting from Launcher version 2.7.0, the Monster Collection and Get
          Reward features will no longer be supported within the launcher.
        </Text>
        <Text>
          However, you can continue to use all Monster Collection features
          within the game client.
        </Text>
        <Text>Thanks!</Text>
      </Box>
    </MainPageContainer>
  );
}
