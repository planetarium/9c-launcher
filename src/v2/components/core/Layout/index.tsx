import React, { useMemo } from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import { useStore } from "../../../utils/useStore";

import WindowControls from "./WindowControls";
import Menu from "../Menu";
import StatusBar from "./StatusBar";

import SettingsOverlay from "../../../views/SettingsOverlay";
import StakingOverlay from "../../../views/StakingOverlay";
import InfoText from "./InfoText";

interface LayoutProps {
  sidebar?: boolean;
}

function Layout({ children, sidebar }: React.PropsWithChildren<LayoutProps>) {
  const { account, overlay } = useStore();

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
        <StatusBar />
        <Menu />
      </aside>
      <InfoText />
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
