import React from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import { ipcRenderer } from "electron";
import WindowControls from "./WindowControls";
import Menu from "../Menu";

const awsSinkGuid: string = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid"
);

interface LayoutProps {
  sidebar?: boolean;
}

function Layout({ children }: React.PropsWithChildren<LayoutProps>) {
  return (
    <div className={styles.layout}>
      <WindowControls />
      <main>{children}</main>
      <aside className={styles.bottomControls}>
        <Menu />
      </aside>
    </div>
  );
}

export default observer(Layout);
