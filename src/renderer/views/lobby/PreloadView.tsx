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
import { electronStore } from "../../../config";
import { YouTubeInternal } from "../../../interfaces/refs";

import { useLocale } from "../../i18n";
import { Preload } from "../../../interfaces/i18n";

const PreloadView = observer((props: IStoreContainer) => {
  const classes = preloadViewStyle();
  const { locale } = useLocale<Preload>("preload");

  const videoOpts: IYoutubeOption = {
    width: "330",
    height: "220",
    playerVars: {
      autoplay: 1,
      mute: electronStore.get("MuteTeaser") ? 1 : 0,
    },
  };

  const handleClickBlockExplorer = useCallback(() => {
    shell.openExternal("https://explorer.libplanet.io/9c-main/");
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
    if (videoOpts.playerVars?.mute === 0) electronStore.set("MuteTeaser", true);
    player.pauseVideo();
  }, [youtubeRef]);

  return (
    <Container className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        {(locale(
          "다른 사용자에게 데이터를 받는 중입니다. 트레일러와 새로운 콘텐츠를 봅시다!"
        ) as string[]).map((paragraph) => (
          <span key={paragraph}>{paragraph}</span>
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
            primary={locale("블록 익스플로러")}
          />
        </ListItem>
        <ListItem button onClick={handleClickPlayerGuide}>
          <ListItemIcon className={classes.listItemIcon}>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText
            className={classes.listItemText}
            primary={locale("나인 크로니클 플레이어 가이드")}
          />
        </ListItem>
      </List>
      <LobbyView {...props} onLaunch={handleLaunch} />
    </Container>
  );
});

export default inject("routerStore", "standaloneStore")(PreloadView);
