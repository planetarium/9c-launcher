import { shell } from "electron";
import React, { useState, useRef, useCallback } from "react";
import YouTube, { Options as IYoutubeOption } from "react-youtube";
import mixpanel from "mixpanel-browser";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import GrainIcon from "@material-ui/icons/Grain";
import { LinearProgressWithLabel } from "../../components/LinerProgressWithLabel";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";
import preloadViewStyle from "./PreloadView.style";
import LobbyView from "./LobbyView";
import { electronStore } from "../../../config";
import { YouTubeInternal } from "../../../interfaces/refs";

import { useLocale } from "../../i18n";

const PreloadView = observer((props: IStoreContainer) => {
  const { routerStore, standaloneStore } = props;
  const classes = preloadViewStyle();
  const [progress, setProgress] = useState(0);

  const { locale } = useLocale("preload");

  const videoOpts: IYoutubeOption = {
    width: "330",
    height: "220",
    playerVars: {
      autoplay: 1,
    },
  };

  const handleClickBlockExplorer = useCallback(() => {
    shell.openExternal("https://explorer.libplanet.io/9c-beta/");
  }, []);

  const handleClickPlayerGuide = useCallback(() => {
    shell.openExternal(
      "https://forum.nine-chronicles.com/t/nine-chronicles-quick-game-guide/31"
    );
  }, []);

  const youtubeRef = useRef<YouTubeInternal>(null);
  const handleLaunch = useCallback(() => {
    const player = youtubeRef.current?.internalPlayer;
    if (player === undefined) throw Error("YouTube Player not found");
    player.pauseVideo();
  }, [youtubeRef]);

  return (
    <Container className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        {(locale(
          "Receiving data from other users. Let's watch teaser and contents!"
        ) as string[]).map((paragraph) => (
          <span key={paragraph}>{paragraph}</span>
        ))}
      </Typography>
      <YouTube videoId="Kf-7NXLVLOE" opts={videoOpts} ref={youtubeRef} />
      <List component="nav">
        <ListItem button onClick={handleClickBlockExplorer}>
          <ListItemIcon className={classes.listItemIcon}>
            <GrainIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={locale("Block Explorer")}
          />
        </ListItem>
        <ListItem button onClick={handleClickPlayerGuide}>
          <ListItemIcon className={classes.listItemIcon}>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={locale("Nine Chronicles Player Guide")}
          />
        </ListItem>
      </List>
      <LobbyView {...props} onLaunch={handleLaunch} />
    </Container>
  );
});

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default inject("routerStore", "standaloneStore")(PreloadView);
