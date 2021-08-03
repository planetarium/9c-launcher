import React from "react";
import { observer } from "mobx-react";
import styles from "./styles.module.scss";
import MenuItem from "./MenuItem";
import MenuDivider from "./MenuDivider";
import { useStore } from "../../../utils/useStore";

import settings from "../../../resources/icons/settings.png";
import refresh from "../../../resources/icons/refresh.png";
import discord from "../../../resources/icons/discord.png";
import logo from "../../../resources/icons/9c.png";
import shop from "../../../resources/icons/shop.png";
import staking from "../../../resources/icons/staking.png";

function Menu() {
  const overlay = useStore("overlay");

  return (
    <div className={styles.menu}>
      <MenuItem icon={staking} text="Staking" onClick={() => void 0} />
      <MenuItem icon={shop} text="Shop" onClick={() => void 0} />
      <MenuItem icon={logo} text="Explorer" onClick={() => void 0} />
      <MenuItem icon={discord} text="Discord" onClick={() => void 0} />
      <MenuDivider />
      <MenuItem icon={refresh} text="Restart" onClick={() => void 0} />
      <MenuItem
        icon={settings}
        disabled={overlay.page === "settings"}
        text="Settings"
        onClick={() => overlay.open("settings")}
      />
    </div>
  );
}

export default observer(Menu);
