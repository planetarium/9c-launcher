import React, { useMemo } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import { useTopmostBlocksQuery } from "../../../generated/graphql";
import { useStore } from "../../../utils/useStore";
import { ipcRenderer } from "electron";
import WindowControls from "./WindowControls";
import Menu from "../Menu";

const awsSinkGuid: string = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid"
);

interface LayoutProps {
  sidebar?: boolean;
}

function Layout({ children, sidebar }: React.PropsWithChildren<LayoutProps>) {
  const { account, overlay } = useStore();
  const { loading, data } = useTopmostBlocksQuery({ pollInterval: 1000 * 10 });
  const topmostBlocks = data?.nodeStatus.topmostBlocks;

  const minedBlocks = useMemo(
    () =>
      account.isLogin && topmostBlocks != null
        ? topmostBlocks.filter((b) => b?.miner == account.selectedAddress)
        : null,
    [account.isLogin, topmostBlocks]
  );

  return (
    <div className={styles.layout}>
      <WindowControls />
      {sidebar && <main className={styles.sidebar}>{children}</main>}
      <aside className={styles.bottomControls}>
        <Menu />
      </aside>
      {overlay.isOpen && <div></div>}
    </div>
  );
}

export default observer(Layout);
