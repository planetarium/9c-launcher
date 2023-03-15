import { app } from "@electron/remote";
import { shell } from "electron";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "src/renderer/resources/icons/9c.png";
import discord from "src/renderer/resources/icons/discord.png";
import exchange from "src/renderer/resources/icons/exchange.png";
import ncgLogo from "src/renderer/resources/icons/ncgLogo.png";
import refresh from "src/renderer/resources/icons/refresh.png";
import settings from "src/renderer/resources/icons/settings.png";
import staking from "src/renderer/resources/icons/staking.png";
import { styled } from "src/renderer/stitches.config";
import MonsterCollectionOverlay from "src/renderer/views/MonsterCollectionOverlay";
import SettingsOverlay from "src/renderer/views/SettingsOverlay";
import TransferAssetOverlay from "src/renderer/views/TransferAssetOverlay/main";
import { useExternalURL } from "src/utils/useExternalURL";
import { useStore } from "src/utils/useStore";
import MenuItem from "./MenuItem";

const MenuContainer = styled("div", {
  opacity: 0.9,
  backgroundColor: "$gray",
  boxSizing: "border-box",
  width: 200,
  padding: 10,
  marginLeft: 20,
  dragable: false,
  whiteSpace: "nowrap",
});

const MenuDivider = styled("hr", {
  margin: "10px 0",
  border: "none",
  borderTop: "1px solid #979797",
});

type Overlay = "settings" | "staking" | "transfer";

function Menu() {
  const account = useStore("account");
  const [currentOverlay, openOverlay] = useState<Overlay | null>(null);
  const history = useHistory();

  const url = useExternalURL();
  useEffect(() => {
    if (!url) return;
    if (url.pathname.startsWith("//open/monster-collection")) {
      openOverlay("staking");
    }
    if (url.pathname.startsWith("//open/transfer-asset")) {
      openOverlay("transfer");
    }
    if (url.pathname.startsWith("//open/activation")) {
      history.push("/register/activationKey");
    }
  }, [url, history]);

  return (
    <MenuContainer>
      <MenuItem
        icon={staking}
        text="Staking"
        disabled={!account.isLogin || currentOverlay === "staking"}
        onClick={() => openOverlay("staking")}
      />
      <MenuItem
        icon={ncgLogo}
        text="WNCG Staking"
        onClick={() =>
          shell.openExternal("https://stake.nine-chronicles.com/wncg")
        }
      />
      <MenuItem
        icon={exchange}
        text="Send NCG"
        disabled={!account.isLogin || currentOverlay === "transfer"}
        onClick={() => openOverlay("transfer")}
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
        disabled={currentOverlay === "settings"}
        text="Settings"
        onClick={() => openOverlay("settings")}
      />
      <SettingsOverlay
        isOpen={currentOverlay === "settings"}
        onClose={() => openOverlay(null)}
      />
      <MonsterCollectionOverlay
        isOpen={currentOverlay === "staking"}
        onClose={() => openOverlay(null)}
      />
      <TransferAssetOverlay
        isOpen={currentOverlay === "transfer"}
        onClose={() => openOverlay(null)}
      />
    </MenuContainer>
  );
}

export default observer(Menu);
