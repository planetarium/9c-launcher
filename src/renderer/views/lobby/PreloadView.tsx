import { shell } from "electron";
import React, { useState, useRef, useCallback } from "react";
import YouTube, { Options as IYoutubeOption } from "react-youtube";

import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import GrainIcon from "@material-ui/icons/Grain";
import preloadViewStyle from "./PreloadView.style";
import LobbyView from "./LobbyView";
import { get as getConfig, userConfigStore } from "../../../config";
import { YouTubeInternal } from "../../../interfaces/refs";

import { T, useT } from "@transifex/react";

const transifexTags = "preload";

const PreloadView = observer((props: IStoreContainer) => {
  const classes = preloadViewStyle();

  const videoOpts: IYoutubeOption = {
    width: "330",
    height: "220",
    playerVars: {
      autoplay: 1,
      mute: getConfig("MuteTeaser") ? 1 : 0,
    },
  };

  const handleClickBlockExplorer = useCallback(() => {
    shell.openExternal("https://explorer.libplanet.io/9c-main/");
  }, []);

  const handleClickPlayerGuide = useCallback(() => {
    shell.openExternal(
      "https://wiki.nine-chronicles.com/en/9C/getting-started"
    );
  }, []);

  const youtubeRef = useRef<YouTubeInternal>(null);
  const handleLaunch = useCallback(() => {
    const player = youtubeRef.current?.internalPlayer;
    if (player === undefined) throw Error("YouTube Player not found");
    if (videoOpts.playerVars?.mute === 0) userConfigStore.set("MuteTeaser", true);
    player.pauseVideo();
  }, [youtubeRef]);

  const welcomeMessage = useT(
    "Receiving data from other users.\nLet's watch the trailer and new content!",
    { _tags: transifexTags }
  );

  return (
    <Container className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        {welcomeMessage.split("\n").map((v: string) => (
          <p>{v}</p>
        ))}
      </Typography>
      <YouTube videoId="Kf-7NXLVLOE" opts={videoOpts} ref={youtubeRef} />
      <List className={classes.links}>
        <ListItem button onClick={handleClickBlockExplorer}>
          <ListItemIcon className={classes.listItemIcon}>
            <GrainIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={<T _str="Block Explorer" _tags={transifexTags} />}
          />
        </ListItem>
        <ListItem button onClick={handleClickPlayerGuide}>
          <ListItemIcon className={classes.listItemIcon}>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={
              <T _str="Nine Chronicles Player Guide" _tags={transifexTags} />
            }
          />
        </ListItem>
      </List>
      <LobbyView {...props} onLaunch={handleLaunch} />
    </Container>
  );
});

export default inject("routerStore", "standaloneStore")(PreloadView);
