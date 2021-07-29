import React, { useMemo } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import { useTopmostBlocksQuery } from "../../../generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";

const awsSinkGuid: string = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid"
);

interface LayoutProps {
  sidebar?: boolean
}

function Layout({ children }: React.PropsWithChildren<LayoutProps>) {
  const accountStore = useStore("account");
  const { loading, data } = useTopmostBlocksQuery({ pollInterval: 1000 * 10 });
  const topmostBlocks = data?.nodeStatus.topmostBlocks;

  const minedBlocks = useMemo(() => 
    accountStore.isLogin && topmostBlocks != null
      ? topmostBlocks.filter((b) => b?.miner == accountStore.selectedAddress)
      : null
  , [accountStore.isLogin, topmostBlocks]); 

  return <div className={styles.layout}>
    <main>{children}</main>
  </div>;
}

export default observer(Layout);
