import React, { useRef, useEffect, Fragment } from "react";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";

import { IStoreContainer } from "../../../interfaces/store";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";
import { T } from "@transifex/react";
import textFit from "textfit";
import { ipcRenderer } from "electron";

const MiningView = observer(
  ({ accountStore, standaloneStore, routerStore }: IStoreContainer) => {
    const classes = miningViewStyle();
    const setMining = (isMining: boolean) => {
      routerStore.push("/lobby/preload");
      const setSucceed: boolean = ipcRenderer.sendSync(
        "standalone/set-private-key",
        accountStore.privateKey
      );
      if (setSucceed) {
        standaloneStore.setPrivateKeyEnded(true);
        accountStore.setMiningConfigStatus(true);
      } else {
        routerStore.push("/error/relaunch");
      }
      if (!ipcRenderer.sendSync("standalone/set-mining", isMining)) {
        routerStore.push("/error/relaunch");
      }
    };

    const descriptionEl = useRef<HTMLParagraphElement>(null);
    const requirementEl = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
      if (descriptionEl.current instanceof HTMLParagraphElement) {
        textFit(descriptionEl.current, { multiLine: true, maxFontSize: 16 });
      }
    }, [descriptionEl.current]);

    useEffect(() => {
      if (requirementEl.current instanceof HTMLParagraphElement) {
        textFit(requirementEl.current, { multiLine: true, maxFontSize: 13 });
      }
    }, [requirementEl.current]);

    return (
      <Container className={classes.root}>
        <h1 className={classes.title}><T _str="Do you want to turn the mining feature on?" _tags="mining" /></h1>
        <img className={classes.jade} src={jade} />
        <p ref={descriptionEl} className={classes.description}>
          <T
            _str="Nine Chronicles pursues an in-game economy that users create together. You can produce Nine Chronicles Gold just by playing the game. During gameplay, you may contribute your computer resources to the operation of Nine Chronicles to earn gold."
            _tags="mining" />
        </p>
        <p ref={requirementEl} className={classes.requirement}>
          
        </p>
        <Box className={classes.buttonContainer}>
          <Button
            className={`${classes.button} ${classes.buttonLeft}`}
            id="mining-off"
            variant="contained"
            onClick={() => {
              ipcRenderer.send("mixpanel-track-event", "Launcher/Mining Off");
              setMining(false);
            }}
          >
            <T _str="OFF" _tags="mining" />
          </Button>
          <Button
            className={`${classes.button} ${classes.buttonRight}`}
            variant="contained"
            onClick={() => {
              ipcRenderer.send("mixpanel-track-event", "Launcher/Mining On");
              setMining(true);
            }}
          >
            <T _str="ON" _tags="mining" />
          </Button>
        </Box>
      </Container>
    );
  }
);

export default inject(
  "accountStore",
  "routerStore",
  "standaloneStore"
)(MiningView);
