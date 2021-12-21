import React from "react";
import { observer } from "mobx-react";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./RPCSpinner.scss";
import { shell } from "electron";
import useStores from "src/hooks/useStores";
import Button from "@material-ui/core/Button";
import { T } from "src/renderer/i18n";

import explorerLogo from "../../resources/block-explorer-logo.png";
import patchNoteLogo from "../../resources/wrench.png";
import DiscordIcon from "../DiscordIcon";
import Typography from "@material-ui/core/Typography";
import errorViewStyle from "src/renderer/views/error/ErrorView.style";

// As this component is expected to be load without Apollo Client,
// you MUST NOT use any Apollo related code here.

const transifexMenuTags = "menu";
const transifexTags = "rpc-loading";

function RPCSpinner() {
  const classes = errorViewStyle();
  return (
    <>
      <main>
        <div className={classes.root}>
          <Typography variant="h1" gutterBottom className={classes.title}>
            <T _str="Searching available RPC nodes..." _tags={transifexTags} />
          </Typography>
          <Typography variant="subtitle1">
            <T
              _str="It may take some time to find a node. If you think you're stuck or you aren't using RPC mode, please contact our Discord."
              _tags={transifexTags}
            />
          </Typography>
        </div>
      </main>
      <div className="hero spinner">
        <CircularProgress />
        <ul className={"LauncherClientOption"}>
          <li>
            <Button
              startIcon={<img src={patchNoteLogo} />}
              onClick={() => {
                shell.openExternal(
                  "https://wiki.nine-chronicles.com/en/9C/patch-notes"
                );
              }}
            >
              <T _str="Patch Note" _tags={transifexMenuTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<img src={explorerLogo} />}
              onClick={() => {
                shell.openExternal("https://9cscan.com");
              }}
            >
              <T _str="Explorer" _tags={transifexMenuTags} />
            </Button>
          </li>
          <li>
            <Button
              startIcon={<DiscordIcon />}
              onClick={() => {
                shell.openExternal("https://discord.gg/planetarium");
              }}
            >
              <T _str="Discord" _tags={transifexMenuTags} />
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default observer(RPCSpinner);
