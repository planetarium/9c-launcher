import React from 'react';
import styles from "./styles.module.scss"

const currentWindow = require('electron').remote.getCurrentWindow();

export default function WindowControls() {
  return <div className={styles.windowControls}>
    <span onClick={() => currentWindow.minimize()}>_</span>
    <span onClick={() => currentWindow.close()}>×</span>
  </div>
}
