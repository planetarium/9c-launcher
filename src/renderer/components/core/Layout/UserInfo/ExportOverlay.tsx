import { styled, Box } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import bitgener from "bitgener";
import DOMPurify from "dompurify";
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
  const [vector, setVector] = useState<{ __html: string }>();
  const account = useStore("account");
  useEffect(() => {
    (async () => {
      const key = await account.exportKeystore();
      if (key && key !== "") {
        const matrix = await bitgener({
          data: key,
          type: "datamatrix",
          output: "string",
          width: 360,
          height: 360,
          hri: {
            show: false,
            marginTop: 0,
          },
        });
        if (matrix.svg) {
          setVector({
            __html: DOMPurify.sanitize(matrix.svg, {
              USE_PROFILES: { svg: true, svgFilters: true },
            }),
          });
        }
      }
    })();
  }, []);

  return (
    <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
      <CloseButton onClick={() => onClose()} />
      <H1 css={{ margin: 0 }}>Key Export</H1>
      <div dangerouslySetInnerHTML={vector} />
      <Box>
        <Text>This is Encrypted Key.</Text>
        <Text>Do Not Show Your Key to Others.</Text>
      </Box>
    </MainPageContainer>
  );
}
