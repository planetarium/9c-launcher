import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";
import mixpanel from "mixpanel-browser";
import { useLocale } from "../../i18n";
import { P } from "../../styles/styled";

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

    const locale = useLocale("mining");

    const requirement = locale("requirement");
    if (typeof requirement === "string")
      throw Error("mining.requirement is not array in src/i18n/index.json");

    return (
      <Container className={classes.root}>
        <h3 className={classes.title}>
          {locale("Do you want to turn mining on?")}
        </h3>
        <img className={classes.jade} src={jade} />
        <p>{locale("description")}</p>
        {requirement.map((paragraph) => (
          <P key={paragraph} className={classes.requirement}>
            {paragraph}
          </P>
        ))}
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
            {locale("OFF")}
          </Button>
          <Button
            className={`${classes.button} ${classes.buttonRight}`}
            variant="contained"
            onClick={() => {
              mixpanel.track("Launcher/Mining On");
              setMining(true);
            }}
          >
            {locale("ON")}
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
