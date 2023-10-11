import { styled, Box } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import writeQR from "@paulmillr/qr";
import { useStore } from "src/utils/useStore";
import OverlayBase, { CloseButton } from "../../OverlayBase";
import Text from "src/renderer/components/ui/Text";
import H1 from "src/renderer/components/ui/H1";
import { OverlayProps } from "src/utils/types";

const MainPageContainer = styled(OverlayBase)({
  "&&": {
    width: "420px",
    height: "600px",
    backgroundColor: "#1d1e1f",
    padding: "48px 48px",
    display: "flex",
    gap: "1rem",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  },
});

export function ExportOverlay({ isOpen, onClose }: OverlayProps) {
  const [vector, setVector] = useState<string>("");
  const account = useStore("account");
  useEffect(() => {
    account.exportKeystore().then((key) => {
      if (typeof key === "string") setVector(writeQR(key, "svg"));
      else return "";
    });
  }, []);

  return (
    <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
      <CloseButton onClick={() => onClose()} />
      <H1 css={{ margin: 0 }}>Key Export</H1>
      <img
        style={{ backgroundColor: "white", padding: "1rem" }}
        src={`data:image/svg+xml;utf8,${vector}`}
      />
      <Box>
        <Text>This is Encrypted Key.</Text>
        <Text>Do Not Show Your Key to Others.</Text>
      </Box>
    </MainPageContainer>
  );
}
