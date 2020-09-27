import React, { useRef, useEffect, Fragment } from "react";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";
import mixpanel from "mixpanel-browser";
import { IStoreContainer } from "../../../interfaces/store";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";
import { useLocale } from "../../i18n";
import { Mining } from "../../../interfaces/i18n";
import textFit from "textfit";

const MiningView = observer(
  ({ accountStore, standaloneStore, routerStore }: IStoreContainer) => {
    const classes = miningViewStyle();
    const setMining = (isMining: boolean) => {
      standaloneStore
        .setPrivateKey(accountStore.privateKey)
        .then(() => {
          standaloneStore.setPrivateKeyEnded();
          return standaloneStore.setMining(isMining);
        })
        .catch((error) => {
          console.log(error);
          routerStore.push("/error/relaunch");
        });
      routerStore.push("/lobby/preload");
    };

    const { locale } = useLocale<Mining>("mining");

    const descriptionEl = useRef<HTMLParagraphElement>(null);
    const requirementEl = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
      if (descriptionEl.current instanceof HTMLParagraphElement) {
        textFit(descriptionEl.current, { multiLine: true });
      }
    }, [descriptionEl.current]);

    useEffect(() => {
      if (requirementEl.current instanceof HTMLParagraphElement) {
        textFit(requirementEl.current, { multiLine: true });
      }
    }, [requirementEl.current]);

    const requirement = locale("requirement");
    const requirementMaxRange = requirement.length - 1;
    if (typeof requirement === "string")
      throw Error("mining.requirement is not array in src/i18n/index.json");

    return (
      <Container className={classes.root}>
        <h1 className={classes.title}>{locale("채굴 기능을 켜시겠습니까?")}</h1>
        <img className={classes.jade} src={jade} />
        <p ref={descriptionEl} className={classes.description}>
          {locale("description")}
        </p>
        <p ref={requirementEl} className={classes.requirement}>
          {requirement.map((paragraph, index) => (
            <Fragment key={paragraph}>
              {paragraph} {index < requirementMaxRange && <br />}
            </Fragment>
          ))}
        </p>
        <Box className={classes.buttonContainer}>
          <Button
            className={`${classes.button} ${classes.buttonLeft}`}
            id="mining-off"
            variant="contained"
            onClick={() => {
              mixpanel.track("Launcher/Mining Off");
              setMining(false);
            }}
          >
            {locale("끄기")}
          </Button>
          <Button
            className={`${classes.button} ${classes.buttonRight}`}
            variant="contained"
            onClick={() => {
              mixpanel.track("Launcher/Mining On");
              setMining(true);
            }}
          >
            {locale("켜기")}
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
