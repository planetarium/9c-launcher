import * as React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import errorViewStyle from "./ErrorView.style";
import { Container, Typography } from "@material-ui/core";

const ErrorView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        Something went wrong.
      </Typography>
      <Typography variant="subtitle1">Please follow step below.</Typography>
      <ol>
        <li>Quit launcher.</li>
        <li>Reopen launcher.</li>
        <li>Clear Cache.</li>
        <li>Download Snapshot.</li>
        <li>Login.</li>
      </ol>
    </Container>
  );
};

export default ErrorView;
