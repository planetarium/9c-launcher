import { ipcRenderer, shell } from "electron";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import HomeIcon from "@material-ui/icons/Home";
import DiscordIcon from "../../components/DiscordIcon";
import SettingsIcon from "@material-ui/icons/Settings";
import "../../styles/layout/layout.scss";
import { useStakingStatusSubscription, useTopmostBlocksQuery } from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { observer } from "mobx-react";

import { useLocale } from "../../i18n";
import { Menu } from "../../../interfaces/i18n";
import { electronStore } from "../../../config";
import AccountInfoContainer from "../../components/AccountInfo/AccountInfoContainer";
import InfoIcon from "../../components/InfoIcon";



export const Layout: React.FC = observer(({ children }) => {
  const { accountStore, routerStore } = useStores();
  const [awsSinkCloudwatchGuid, setAwsSinkCloudwatchGuid] = useState<string>();
  const [infoButtonState,setInfoButtonState] = useState(false)

  const { locale } = useLocale<Menu>("menu");

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

  function handleInfoClick(){
    const clipboardElement =(document.getElementById('clipboard') as HTMLTextAreaElement)!;
    const stringValue = `
      APV: ${electronStore.get("AppProtocolVersion") as string} 
      Address: ${accountStore.selectedAddress} 
      Debug: ${accountStore.isLogin} / ${topmostBlocksResult.loading}
      Mined blocks: ${minedBlocks?.length} (out of recent ${topmostBlocks?.length} blocks)
      ${awsSinkCloudwatchGuid !== null && (`Client ID: ${awsSinkCloudwatchGuid}`)}
    `
    clipboardElement.value = stringValue
    clipboardElement.select();
    document.execCommand('copy');
    clipboardElement.value = ''
    clipboardElement.blur();

    setInfoButtonState(true)
    setTimeout(()=>{
      setInfoButtonState(false)
    },1500)
  }


  return (
    <>
      <main>{children}</main>
      <nav className="hero">
      <AccountInfoContainer
        minedBlock={Number(minedBlocks?.length)}
        onReward={() => {}}
        onOpenWindow={() => {ipcRenderer.invoke('open staking page')}}/>
        <ul className={"LauncherClientOption"}>
          <li>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => {
                shell.openExternal("https://forum.nine-chronicles.com");
              }}
            >
              {locale("Forum")}
            </Button>
          </li>
          <li>
            <Button
              startIcon={<DiscordIcon />}
              onClick={() => {
                shell.openExternal("https://discord.gg/planetarium");
              }}
            >
              {locale("Discord")}
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
              {locale("Settings")}
            </Button>
          </li>
        </ul>
        <div
          id={'LauncherClientIcon'}
          className={`LauncherClientIcon ${infoButtonState?'activate':''}`}
          onClick={handleInfoClick}>
          <InfoIcon/>
          <div>{infoButtonState?'copied!':'info'}</div>
        </div>
        <textarea id={'clipboard'} className={'clipboard'}/>
      </nav>
    </>
  );
});
