import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";
import miningViewStyle from "./MiningView.style";
import jade from "../../resources/miningJade.png";

const MiningView = observer(
  ({ accountStore, standaloneStore, routerStore }: IStoreContainer) => {
    const classes = miningViewStyle();
    const setMining = (isMining: boolean) => {
      routerStore.push("/lobby/preload");
      standaloneStore
        .setMining(isMining, accountStore.privateKey)
        .catch((error) => {
          console.log(error);
          routerStore.push("/error");
        });
    };

    return (
      <Container className={classes.root}>
        <h3 className={classes.title}>Please turn on the mining option.</h3>
        <img className={classes.jade} src={jade} />
        <p>
          Nine Chronicles pursues an in-game economy that users create together.
          You can produce gold just by playing games. Instead, you will
          contribute your computer resources to the operation of Nine
          Chronicles.
        </p>
        <Box className={classes.buttonContainer}>
          <Button
            className={`${classes.button} ${classes.buttonLeft}`}
            variant="contained"
            onClick={() => {
              setMining(false);
            }}
          >
            Not now
          </Button>
          <Button
            className={`${classes.button} ${classes.buttonRight}`}
            variant="contained"
            color="primary"
            onClick={() => {
              setMining(true);
            }}
          >
            Got it!
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
