import { ipcRenderer, shell } from "electron";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import HomeIcon from "@material-ui/icons/Home";
import DiscordIcon from "../../components/DiscordIcon";
import SettingsIcon from "@material-ui/icons/Settings";
import "../../styles/layout/layout.scss";
import { useTopmostBlocksQuery } from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { observer } from "mobx-react";

import { useLocale } from "../../i18n";
import { Menu } from "../../../interfaces/i18n";
import { electronStore } from "../../../config";

export const Layout: React.FC = observer(({ children }) => {
  const { accountStore, routerStore } = useStores();
  const [awsSinkCloudwatchGuid, setAwsSinkCloudwatchGuid] = useState<string>();

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

  return (
    <>
      <main>{children}</main>
      <nav className="hero">
        <ul>
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
        <div>
          <ul>
            <li>
              APV:{" "}
              <code>
                {
                  (electronStore.get("AppProtocolVersion") as string).split(
                    "/"
                  )[0]
                }
                <span className="details">
                  /
                  {
                    (electronStore.get("AppProtocolVersion") as string).split(
                      "/"
                    )[1]
                  }
                </span>
              </code>
            </li>
            {accountStore.isLogin ? (
              <li>
                Address: <code>{accountStore.selectedAddress}</code>
              </li>
            ) : (
              <></>
            )}
            {minedBlocks !== null ? (
              <li>
                Mined blocks: {minedBlocks.length} (out of recent{" "}
                {topmostBlocks?.length} blocks)
              </li>
            ) : (
              <li>
                Debug: {accountStore.isLogin} / {topmostBlocksResult.loading}
              </li>
            )}
            {awsSinkCloudwatchGuid !== null ? (
              <li>Client ID: {awsSinkCloudwatchGuid}</li>
            ) : (
              <></>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
});
