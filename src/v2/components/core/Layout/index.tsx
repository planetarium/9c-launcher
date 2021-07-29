import React from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";

function Layout() {
  return <div className={styles.layout} />;
}

export default observer(Layout);
