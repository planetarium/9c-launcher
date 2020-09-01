import * as React from "react";
import { observer, inject } from "mobx-react";
import LobbyView from "../lobby/LobbyView";
import LoginView from "../login/LoginView";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import { Button, Container, Box } from "@material-ui/core";
import { NineChroniclesLogo } from "../../components/NineChroniclesLogo";
import mainViewStyle from "./MainView.style";

import { useLocale } from "../../i18n";

const MainView = observer(
  ({ accountStore, routerStore, gameStore }: IStoreContainer) => {
    const classes = mainViewStyle();
    const locale = useLocale("main");

    const description = locale("description");
    if (typeof description === "string")
      throw Error("main.description is not array in src/i18n/index.json");

    return (
      <Container className={classes.root}>
        <NineChroniclesLogo />
        <h3 className={classes.title}>
          {locale("Welcome to nine chronicles!")}
        </h3>
        {description.map((paragraph) => (
          <p key={paragraph} className={classes.body}>
            {paragraph}
          </p>
        ))}

        <Box className={classes.buttonContainer}>
          <Button
            onClick={() => routerStore.push("/account/create")}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            {locale("Create Account")}
          </Button>
        </Box>
      </Container>
    );
  }
);

export default inject("accountStore", "routerStore", "gameStore")(MainView);
