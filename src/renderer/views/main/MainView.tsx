import * as React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "../login/LoginView";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import { Button, Container, Box } from "@material-ui/core";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import mainViewStyle from "./MainView.style";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    const classes = mainViewStyle();
    return (
      <Container className={classes.root}>
        <NineChroniclesLogo />
        <h3 className={classes.title}>Welcome to nine chronicles!</h3>
        <p className={classes.body}>It is a fantasy world on the blockchain.</p>
        <p className={classes.body}>
          To start the game, you need to create your account.
        </p>
        <Box className={classes.buttonContainer}>
          <Button
            onClick={() => routerStore.push("/account/create")}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Create Account
          </Button>
        </Box>
      </Container>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
