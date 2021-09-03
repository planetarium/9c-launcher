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
import clsx from "clsx";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";

interface LayoutProps {
  sidebar?: boolean;
  className?: string;
}

function Layout({
  children,
  sidebar,
  className,
}: React.PropsWithChildren<LayoutProps>) {
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
      {sidebar && (
        <main className={clsx(styles.sidebar, className)}>{children}</main>
      )}
      <aside className={styles.bottomControls}>
        <StatusBar />
        <Menu />
      </aside>
      <InfoText />
      <AnimatePresence>
        {overlay.isOpen && (
          <motion.div
            className={styles.overlayContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onOverlayOutsideClicked}
          >
            {page}
          </motion.div>
        )}
      </AnimatePresence>
      <WindowControls />
    </div>
  );
}

export default observer(Layout);
