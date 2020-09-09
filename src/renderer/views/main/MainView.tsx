import React from "react";
import { observer, inject } from "mobx-react";
import { Button, Container, Box } from "@material-ui/core";
import { IStoreContainer } from "../../../interfaces/store";
import NineChroniclesLogo from "../../components/NineChroniclesLogo";
import mainViewStyle from "./MainView.style";

import { useLocale } from "../../i18n";

const MainView = observer(({ routerStore }: IStoreContainer) => {
  const classes = mainViewStyle();
  const { locale } = useLocale("main");

  const description = locale("description");
  if (typeof description === "string")
    throw Error("main.description is not array in src/i18n/index.json");

  return (
    <Container className={classes.root}>
      <NineChroniclesLogo />
      <h1 className={classes.title}>{locale("Welcome to nine chronicles!")}</h1>
      <article className={classes.body}>
        {description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>

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
});

export default inject("routerStore")(MainView);
