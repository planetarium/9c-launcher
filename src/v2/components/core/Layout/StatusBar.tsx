import React from "react";
import styles from "./styles.module.scss";
import { observer } from "mobx-react";
import ProgressBar from "./ProgressBar";

function StatusBar() {
  // TODO: Implement status fetcher
  return (
    <div className={styles.statusBar}>
      <span>Executing Actions.. (8/8) 37% 1130</span>
      <ProgressBar percent={40} />
    </div>
  );
}

export default observer(StatusBar);
