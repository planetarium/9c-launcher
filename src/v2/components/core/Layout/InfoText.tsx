import React, { useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";

import { useStore } from "../../../utils/useStore";
import { clipboard, ipcRenderer } from "electron";
import { get as getConfig } from "../../../../config";
import { useTopmostBlocksQuery } from "../../../generated/graphql";

const awsSinkGuid: string | undefined = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid"
);

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

  return (
    <div className={styles.infotext} onClick={onClick}>
      {`v${getConfig("AppProtocolVersion").split("/")[0]}`}
      {copied && " copied!"}
    </div>
  );
}

export default observer(InfoText);
