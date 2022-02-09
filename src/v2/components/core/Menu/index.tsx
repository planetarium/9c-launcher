import React, { useState } from "react";
import { observer } from "mobx-react";
import MenuItem from "./MenuItem";
import { useStore } from "../../../utils/useStore";
import { ipcRenderer, shell } from "electron";
import { styled } from "src/v2/stitches.config";

import settings from "../../../resources/icons/settings.png";
import refresh from "../../../resources/icons/refresh.png";
import discord from "../../../resources/icons/discord.png";
import logo from "../../../resources/icons/9c.png";
import staking from "../../../resources/icons/staking.png";
import ncgLogo from "../../../resources/icons/ncgLogo.png";
import SettingsOverlay from "src/v2/views/SettingsOverlay";
import { AnimatePresence } from "framer-motion";

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
  const account = useStore("account");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <MenuContainer>
      <MenuItem
        icon={staking}
        text="Staking"
        onClick={() =>
          ipcRenderer.invoke("open collection page", account.selectedAddress)
        }
      />
      <MenuItem
        icon={ncgLogo}
        text="Send NCG"
        onClick={() =>
          ipcRenderer.invoke("open transfer page", account.selectedAddress)
        }
      />
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
        disabled={isSettingsOpen}
        text="Settings"
        onClick={() => setIsSettingsOpen(true)}
      />
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </MenuContainer>
  );
}

export default observer(Menu);
