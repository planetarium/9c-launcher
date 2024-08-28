import { styled, Box, Button, Backdrop } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import DummyQR from "src/renderer/resources/DummyQR.png";
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
    padding: "2rem",
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

const imageBox = {
  backgroundColor: "white",
  padding: "2rem",
};

const hiddenBox = {
  ...imageBox,
  filter: "blur(0.5rem) brightness(1.2)",
};

export function ExportOverlay({ isOpen, onClose }: OverlayProps) {
  const [vector, setVector] = useState<string>("");
  const [hidden, setHidden] = useState<boolean>(true);
  const account = useStore("account");
  useEffect(() => {
    account.exportKeystore().then((key) => {
      if (typeof key === "string") setVector(writeQR(key, "svg"));
      else return "";
    });
  }, []);

  return (
    <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
      <CloseButton
        onClick={() => {
          setHidden(true);
          onClose();
        }}
      />
      <H1 css={{ margin: 0 }}>Key Export</H1>
      <Box style={SquareBox}>
        {hidden ? (
          <img style={hiddenBox} src={DummyQR}></img>
        ) : (
          <img style={imageBox} src={`data:image/svg+xml;utf8,${vector}`} />
        )}
      </Box>
      <Box marginBottom={0}>
        <Text>This is Encrypted Key.</Text>
        <Text>Do Not Show Your Key to Others.</Text>
      </Box>
      <Button
        onClick={() => setHidden(!hidden)}
        variant={hidden ? "outlined" : "contained"}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          color: `${hidden ? "white" : "black"}`,
          borderColor: `${hidden ? "white" : "black"}`,
        }}
      >
        Show / Hide QR Code
      </Button>
    </MainPageContainer>
  );
}
