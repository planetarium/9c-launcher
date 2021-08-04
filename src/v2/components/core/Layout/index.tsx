import React, { useMemo } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import { useTopmostBlocksQuery } from "../../../generated/graphql";
import { useStore } from "../../../utils/useStore";
import { ipcRenderer } from "electron";
import WindowControls from "./WindowControls";
import Menu from "../Menu";
import SettingsOverlay from "../../../views/SettingsOverlay";
import StakingOverlay from "../../../views/StakingOverlay";

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

  const page =
    overlay.page &&
    {
      settings: <SettingsOverlay />,
      staking: <StakingOverlay />,
    }[overlay.page];

  const onOverlayOutsideClicked = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (ev.target !== ev.currentTarget) return;
    overlay.close();
  };

  return (
    <div className={styles.layout}>
      {sidebar && <main className={styles.sidebar}>{children}</main>}
      <aside className={styles.bottomControls}>
        <Menu />
      </aside>
      {overlay.isOpen && (
        <div
          className={styles.overlayContainer}
          onClick={onOverlayOutsideClicked}
        >
          {page}
        </div>
      )}
      <WindowControls />
    </div>
  );
}

export default observer(Layout);
