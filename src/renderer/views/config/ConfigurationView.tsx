import * as React from "react";
import { Button, Container, TextField, FormLabel } from "@material-ui/core";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { RootChainFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";

const ConfigurationView = () => {
  const handleSubmit = (event: RootChainFormEvent) => {
    event.preventDefault();
    const rootChainPath = event.target.rootchain.value;
    const chainDir = event.target.chain.value;
    electronStore.set("BlockchainStoreDirParent", rootChainPath);
    electronStore.set("BlockchainStoreDirName", chainDir);
  };

  const { routerStore } = useStores();
  const classes = configurationViewStyle();

  return (
    <div className={classes.root}>
      <Button onClick={() => routerStore.goBack()} className={classes.exit}>
        X
      </Button>
      <Container>
        <form onSubmit={handleSubmit}>
          <FormLabel>Root chain store path</FormLabel>
          <TextField
            fullWidth
            name="rootchain"
            defaultValue={blockchainStoreDirParent}
          />
          <FormLabel>Chain store directory name</FormLabel>
          <TextField
            fullWidth
            name="chain"
            defaultValue={electronStore.get("BlockchainStoreDirName")}
          />
          <Button
            type="submit"
            className={classes.submit}
            color="primary"
            variant="contained"
          >
            OK
          </Button>
        </form>
      </Container>
      <br />
      <br />
    </div>
  );
};

export default ConfigurationView;
