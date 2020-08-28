import { shell } from "electron";
import * as React from "react";
import Button from "@material-ui/core/Button";
import HomeIcon from "@material-ui/icons/Home";
import DiscordIcon from "../../components/DiscordIcon";
import SettingsIcon from "@material-ui/icons/Settings";
import "../../styles/layout/layout.scss";
import useStores from "../../../hooks/useStores";

export interface ILayoutProps {}

export const Layout: React.FC<ILayoutProps> = ({ children }) => {
  const { routerStore } = useStores();
  return (
    <div className="layout">
      <div className="container">
        <div className="banner">
          <ul className="nav">
            <li>
              <Button
                startIcon={<HomeIcon />}
                onClick={() => {
                  shell.openExternal("https://forum.nine-chronicles.com");
                }}
              >
                Forum
              </Button>
            </li>
            <li>
              <Button
                startIcon={<DiscordIcon />}
                onClick={() => {
                  shell.openExternal("https://discord.gg/planetarium");
                }}
              >
                Discord
              </Button>
            </li>
            <li>
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => {
                  routerStore.push("/config");
                }}
              >
                Settings
              </Button>
            </li>
          </ul>
        </div>
        <div className="body">{children}</div>
      </div>
    </div>
  );
};
