import React, { useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react";

import { clipboard, ipcRenderer } from "electron";
import { get as getConfig, NodeInfo } from "src/config";
import { styled } from "src/renderer/stitches.config";
import toast from "react-hot-toast";
import { T } from "@transifex/react";
import { useTip } from "src/utils/useTip";
import { useLoginSession } from "src/utils/useLoginSession";

const awsSinkGuid: string | undefined = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid",
);

const InfoTextStyled = styled("div", {
  position: "fixed",
  bottom: 50,
  left: 50,
  dragable: false,
});

function InfoText() {
  const address = useLoginSession()?.address;
  const [node, setNode] = useState<string>("loading");
  const [apv, setApv] = useState<number>(0);

  const debugValue = useMemo(
    () =>
      [
        `APV: ${apv}`,
        address && `Account: ${address.toString()}`,
        `Node: ${node}`,
        awsSinkGuid && `Client ID: ${awsSinkGuid}`,
        `Commit: ${GIT_HASH}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [address, node, awsSinkGuid],
  );

  const onClick = () => {
    clipboard.writeText(debugValue);
    toast(<T _str="Copied diagnostic information." _tags="v2/diagnostics" />, {
      position: "bottom-left",
      id: "diagnostics-copied",
    });
  };

  const blockTip = useTip();

  useEffect(
    () =>
      void (async () => {
        if (node !== "loading") return;
        const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");
        setNode(nodeInfo.host);
        setApv(nodeInfo.apv);
      })(),
    [node],
  );

  return (
    <InfoTextStyled onClick={onClick}>
      node: {node}
      <br />
      tip: {blockTip}
      <br />
      {`version: v${apv}`}
    </InfoTextStyled>
  );
}

export default observer(InfoText);
