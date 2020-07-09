import * as React from "react";
import { remote } from "electron";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import errorViewStyle from "./ErrorView.style";
import { Button, Container, Typography } from "@material-ui/core";

const ErrorView: React.FC<{}> = () => {
  const classes = errorViewStyle();
  const handleRelaunch = React.useCallback(() => {
    remote.app.relaunch();
    remote.app.exit();
  }, []);
  return (
    <Container className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        Something went wrong.
      </Typography>
      <Typography variant="subtitle1">Please follow step below.</Typography>
      <ol>
        <li>Relaunch &ldquo;Nine Chornicles&rdquo;</li>
        <li>Click Download Snapshot</li>
        <li>Login once again</li>
      </ol>
      <Button
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleRelaunch}
      >
        Relaunch
      </Button>
    </Container>
  );
};

export default ErrorView;
