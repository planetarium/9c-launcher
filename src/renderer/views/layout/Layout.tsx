import { ipcRenderer, shell } from "electron";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import DiscordIcon from "../../components/DiscordIcon";
import SettingsIcon from "@material-ui/icons/Settings";
import "../../styles/layout/layout.scss";
import { useTopmostBlocksQuery } from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { observer } from "mobx-react";

import { T } from "@transifex/react";
import { get as getConfig } from "../../../config";
import AccountInfoContainer from "../../components/AccountInfo/AccountInfoContainer";
import InfoIcon from "../../components/InfoIcon";

import explorerLogo from "../../resources/block-explorer-logo.png";
import patchNoteLogo from "../../resources/wrench.png";
import NCGLogo from "../../resources/ncgLogo.png";

const transifexTags = "menu";

export const Layout: React.FC = observer(({ children }) => {
  const { accountStore, routerStore } = useStores();
  const [awsSinkCloudwatchGuid, setAwsSinkCloudwatchGuid] = useState<string>();
  const [infoButtonState, setInfoButtonState] = useState(false);

  const topmostBlocksResult = useTopmostBlocksQuery();
  topmostBlocksResult.startPolling(1000 * 10); // 10 seconds
  const topmostBlocks = topmostBlocksResult.data?.nodeStatus.topmostBlocks;
  const minedBlocks =
    accountStore.isLogin && topmostBlocks != null
      ? topmostBlocks.filter((b) => b?.miner == accountStore.selectedAddress)
      : null;
  useEffect(() => {
    const awsSinkGuid: string = ipcRenderer.sendSync(
      "get-aws-sink-cloudwatch-guid"
    );
    setAwsSinkCloudwatchGuid(awsSinkGuid);
  }, []);

  function handleInfoClick() {
    const clipboardElement = (document.getElementById(
      "clipboard"
    ) as HTMLTextAreaElement)!;
    const stringValue = `
      APV: ${getConfig("AppProtocolVersion") as string} 
      Address: ${accountStore.selectedAddress} 
      Debug: ${accountStore.isLogin} / ${topmostBlocksResult.loading}
      Mined blocks: ${minedBlocks?.length} (out of recent ${topmostBlocks?.length
      } blocks)
      ${awsSinkCloudwatchGuid !== null && `Client ID: ${awsSinkCloudwatchGuid}`}
    `;
    clipboardElement.value = stringValue;
    clipboardElement.select();
    document.execCommand("copy");
    clipboardElement.value = "";
    clipboardElement.blur();

    setInfoButtonState(true);
    setTimeout(() => {
      setInfoButtonState(false);
    }, 1500);
  }

  return (
    <>
      <main>{children}</main>
      <nav className="hero">
        <AccountInfoContainer
          minedBlock={Number(minedBlocks?.length)}
          onReward={() => { }}
          onOpenWindow={() => {
            ipcRenderer.invoke("open collection page");
          }}
        />
        <ul className={"LauncherClientOption"}>
          <li>
            <Button
              startIcon={<img src={NCGLogo} />}
              onClick={() => {
                ipcRenderer.invoke("open transfer page");
              }}
            >
              <T _str="Send NCG" _tags={transifexTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<img src={patchNoteLogo} />}
              onClick={() => {
                shell.openExternal(
                  "https://wiki.nine-chronicles.com/en/9C/patch-notes"
                );
              }}
            >
              <T _str="Patch Note" _tags={transifexTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<img src={explorerLogo} />}
              onClick={() => {
                shell.openExternal("http://explorer.libplanet.io/9c-main/");
              }}
            >
              <T _str="Explorer" _tags={transifexTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<DiscordIcon />}
              onClick={() => {
                shell.openExternal("https://discord.gg/planetarium");
              }}
            >
              <T _str="Discord" _tags={transifexTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<SettingsIcon />}
              className="settings-icon"
              disabled={routerStore.location.pathname === "/config"}
              onClick={() => {
                routerStore.push("/config");
              }}
            >
              <T _str="Settings" _tags={transifexTags} />
            </Button>
          </li>
        </ul>
        <div className="LauncherLayoutVersion">{`v${(getConfig("AppProtocolVersion") as string).split("/")[0]
          }`}</div>
        <div
          id={"LauncherClientIcon"}
          className={`LauncherClientIcon ${infoButtonState ? "activate" : ""}`}
          onClick={handleInfoClick}
        >
          <InfoIcon />
          <div>{infoButtonState ? "copied!" : "info"}</div>
        </div>
        <textarea id={"clipboard"} className={"clipboard"} />
      </nav>
    </>
  );
});
