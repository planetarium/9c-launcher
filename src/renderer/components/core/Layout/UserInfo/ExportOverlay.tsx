import { Button, Container, styled, Typography } from "@material-ui/core";
import React, { useEffect, useMemo } from "react";
import bwipjs from "bwip-js";
import { useStore } from "src/utils/useStore";
import OverlayBase, { CloseButton } from "../../OverlayBase";
import { OverlayProps } from "src/utils/types";

const MainPageContainer = styled(OverlayBase)({
  "&&": {
    width: "650px",
    height: "650px",
    backgroundColor: "#1d1e1f",
    padding: "48px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  },
});

export function ExportOverlay({ isOpen, onClose }: OverlayProps) {
  const account = useStore("account");
  account.exportKeystore().then((keystoreString) => {
    if (keystoreString) {
      try {
        bwipjs.toCanvas("keystoreDMX", {
          bcid: "datamatrix", // Barcode type
          text: keystoreString, // Text to encode
          scale: 3, // 3x scaling factor
        });
      } catch (e) {
        console.error(e);
      }
    }
  });

  return (
    <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
      <CloseButton onClick={() => onClose()} />
      <canvas
        style={{ backgroundColor: "white", padding: "1rem", width: "100%" }}
        id="keystoreDMX"
      ></canvas>
    </MainPageContainer>
  );
}
