import React, { useState, MouseEvent, ChangeEvent } from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "../login/LoginView";
import { IStoreContainer } from "../../../interfaces/store";
import { Button, Container, Box } from "@material-ui/core";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import mainViewStyle from "./MainView.style";

import { T } from "../../i18n";
import TextButton from "../../components/TextButton";

const transifexTags = "main";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    const classes = mainViewStyle();

    const handleResetPassword = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      routerStore.push("/account/reset/review-private-key");
    };

    return (
      <Container className={classes.root}>
        <NineChroniclesLogo />
        <h1 className={classes.title}>
          <T _str="Welcome to Nine Chronicles!" _tags={transifexTags} />
        </h1>
        <article className={classes.body}>
          <T
            _str={
              "This is a fantasy world on the blockchain.\n" +
              "You need to create an account to start the game."
            }
            _tags={transifexTags}
          />
        </article>

        <Box className={classes.buttonContainer}>
          <Button
            onClick={() => routerStore.push("/account/create")}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            <T _str="Create Account" _tags={transifexTags} />
          </Button>
          <TextButton onClick={handleResetPassword} className={classes.revoke}>
            <T _str="I already have my private key" _tags={transifexTags} />
          </TextButton>
        </Box>
      </Container>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
