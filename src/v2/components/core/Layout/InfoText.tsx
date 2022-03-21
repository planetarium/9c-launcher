import React, { useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react";

import { useStore } from "../../../utils/useStore";
import { clipboard, ipcRenderer } from "electron";
import { get as getConfig, NodeInfo } from "../../../../config";
import {
  useTipSubscription,
  useTopmostBlocksQuery,
} from "../../../generated/graphql";
import { styled } from "src/v2/stitches.config";

const awsSinkGuid: string | undefined = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid"
);

const InfoTextStyled = styled("div", {
  position: "fixed",
  bottom: 50,
  left: 50,
  dragable: false,
});

function InfoText() {
  const account = useStore("account");
  const { loading, data } = useTopmostBlocksQuery({ pollInterval: 1000 * 10 });
  const topmostBlocks = data?.nodeStatus.topmostBlocks;

  const minedBlocks = useMemo(
    () =>
      account.isLogin && topmostBlocks != null
        ? topmostBlocks.filter((b) => b?.miner == account.selectedAddress)
        : null,
    [account.isLogin, topmostBlocks]
  );

  const debugValue = useMemo(
    () =>
      [
        `APV: ${getConfig("AppProtocolVersion")}`,
        account.isLogin && `Account: ${account.selectedAddress}`,
        `Debug: ${account.isLogin} / ${loading}`,
        minedBlocks &&
          `Mined blocks: ${minedBlocks?.length} (out of recent ${topmostBlocks?.length} blocks)`,
        awsSinkGuid && `Client ID: ${awsSinkGuid}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [account.isLogin, loading, topmostBlocks, minedBlocks]
  );

  const [copied, setCopied] = useState(false);
  const onClick = () => {
    clipboard.writeText(debugValue);
    setCopied(true);
  };
  useEffect(() => {
    if (!copied) return;
    setTimeout(() => setCopied(false), 1000);
  }, [copied]);

  const { data: blockTip } = useTipSubscription();
  const [node, setNode] = useState<string>("loading");

  useEffect(
    () =>
      void (async () => {
        if (node !== "loading") return;
        const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");
        setNode(nodeInfo.host);
      })(),
    [node]
  );

  return (
    <InfoTextStyled onClick={onClick}>
      node: {node}
      <br />
      tip: {blockTip?.tipChanged?.index || 0}
      <br />
      {`version: v${getConfig("AppProtocolVersion").split("/")[0]}`}
      {copied && " copied!"}
    </InfoTextStyled>
  );
}

export default observer(InfoText);
