import React from "react"
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import MenuItem from "./MenuItem";

import settings from "../../../resources/icons/settings.png"

function Menu() {
  return <div className={styles.menu}>
    <MenuItem icon={settings} text="Settings" onClick={() => void 0} />
  </div>;
}

export default observer(Menu);
