import React, { useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react";

import { clipboard, ipcRenderer } from "electron";
import { get as getConfig, NodeInfo } from "src/config";
import { styled } from "src/renderer/stitches.config";
import toast from "react-hot-toast";
import { T } from "@transifex/react";
import { useTip } from "src/utils/useTip";
import { useLoginSession } from "src/utils/useLoginSession";
import { useStore } from "src/utils/useStore";

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
  const { rpc } = useStore();

  const debugValue = useMemo(
    () =>
      [
        `APV: ${rpc.node?.apv}`,
        address && `Account: ${address.toString()}`,
        `Node: ${rpc.node}`,
        awsSinkGuid && `Client ID: ${awsSinkGuid}`,
        `Commit: ${GIT_HASH}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [address, rpc.node, awsSinkGuid],
  );

  const onClick = () => {
    clipboard.writeText(debugValue);
    toast(<T _str="Copied diagnostic information." _tags="v2/diagnostics" />, {
      position: "bottom-left",
      id: "diagnostics-copied",
    });
  };

  const blockTip = useTip();

  return (
    <InfoTextStyled onClick={onClick}>
      node: {rpc.node?.host}
      <br />
      tip: {blockTip}
      <br />
      {`version: v${rpc.node?.apv}`}
    </InfoTextStyled>
  );
}

export default observer(InfoText);
