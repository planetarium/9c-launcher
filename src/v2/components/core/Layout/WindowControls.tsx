import React from "react";
import styles from "./styles.module.scss";

const currentWindow = require("electron").remote.getCurrentWindow();

export default function WindowControls() {
  return (
    <div className={styles.windowControls}>
      <div onClick={() => currentWindow.minimize()}>_</div>
      <div onClick={() => currentWindow.close()}>×</div>
    </div>
  );
}
