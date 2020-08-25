import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";
import mixpanel from "mixpanel-browser";

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

    return (
      <Container className={classes.root}>
        <h3 className={classes.title}>Do you want to turn mining on?</h3>
        <img className={classes.jade} src={jade} />
        <p>
          Nine Chronicles pursues an in-game economy that users create together.
          You can produce gold just by playing games. Instead, you will
          contribute your computer resources to the operation of Nine
          Chronicles.
        </p>
        <p className={classes.requirement}>
          REQUIRE: <br />
          Requires a 64-bit processor and operating system <br />
          Processor: Quad core CPU 3.0 GHz <br />
          Memory: 16 GB RAM
        </p>
        <Box className={classes.buttonContainer}>
          <Button
            className={`${classes.button} ${classes.buttonLeft}`}
            variant="contained"
            onClick={() => {
              mixpanel.track("Launcher/Mining Off");
              setMining(false);
            }}
          >
            <p>
              Turn Mining<p className={classes.emphasize}>Off</p>
            </p>
          </Button>
          <Button
            className={`${classes.button} ${classes.buttonRight}`}
            variant="contained"
            onClick={() => {
              mixpanel.track("Launcher/Mining On");
              setMining(true);
            }}
          >
            <p>
              Turn Mining<p className={classes.emphasize}>On</p>
            </p>
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
