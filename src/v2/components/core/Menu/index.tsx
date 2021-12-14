import React from "react";
import { observer } from "mobx-react";
import MenuItem from "./MenuItem";
import { useStore } from "../../../utils/useStore";
import { shell } from "electron";

import settings from "../../../resources/icons/settings.png";
import refresh from "../../../resources/icons/refresh.png";
import discord from "../../../resources/icons/discord.png";
import logo from "../../../resources/icons/9c.png";
import staking from "../../../resources/icons/staking.png";
import { styled } from "src/v2/stitches.config";

const MenuContainer = styled("div", {
  opacity: 0.9,
  backgroundColor: "$gray",
  boxSizing: "border-box",
  width: 160,
  padding: 10,
  marginLeft: 20,
  dragable: false,
});

const MenuDivider = styled("hr", {
  margin: "10px 0",
  border: "none",
  borderTop: "1px solid #979797",
});

const app = require("electron").remote.app;

function Menu() {
  const overlay = useStore("overlay");

  return (
    <MenuContainer>
      <MenuItem icon={staking} text="Staking" onClick={() => void 0} />
      <MenuItem
        icon={logo}
        text="Explorer"
        onClick={() => shell.openExternal("https://9cscan.com/")}
      />
      <MenuItem
        icon={discord}
        text="Discord"
        onClick={() => shell.openExternal("https://bit.ly/planetarium-discord")}
      />
      <MenuDivider />
      <MenuItem
        icon={refresh}
        text="Restart"
        onClick={() => {
          app.relaunch();
          app.exit();
        }}
      />
      <MenuItem
        icon={settings}
        disabled={overlay.page === "settings"}
        text="Settings"
        onClick={() => overlay.open("settings")}
      />
    </MenuContainer>
  );
}

export default observer(Menu);
