import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button, Container } from "@material-ui/core";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";

const MiningView = observer(
  ({ accountStore, standaloneStore, routerStore }: IStoreContainer) => {
    const classes = miningViewStyle();
    const runStandalone = (isMining: boolean) => {
      standaloneStore.setMiner(!isMining);
      routerStore.push("/lobby/preload");
      standaloneStore.initStandalone(accountStore.privateKey).catch((error) => {
        console.log(error);
        routerStore.push("/error");
      });
    };

    return (
      <Container className={classes.root}>
        <h2 className={classes.title}>Please turn on the mining option.</h2>
        <img className={classes.jade} src={jade} />
        <p>
          Nine Chronicles pursues an in-game economy that users create together.
          You can produce gold just by playing games. Instead, you will
          contribute your computer resources to the operation of Nine
          Chronicles.
        </p>
        <Button
          className={classes.button}
          variant="contained"
          onClick={() => {
            runStandalone(false);
          }}
        >
          Not now
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={() => {
            runStandalone(true);
          }}
        >
          Got it!
        </Button>
      </Container>
    );
  }
);

export default inject(
  "accountStore",
  "routerStore",
  "standaloneStore"
)(MiningView);
