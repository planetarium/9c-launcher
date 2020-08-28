import * as React from "react";
import { Button, Container, TextField, FormLabel } from "@material-ui/core";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { RootChainFormEvent } from "../../../interfaces/event";

const ConfigurationView = () => {
  const handleSubmit = (event: RootChainFormEvent) => {
    event.preventDefault();
    const rootChainPath = event.target.rootchain.value;
    const chainDir = event.target.chain.value;
    electronStore.set("BlockchainStoreDirParent", rootChainPath);
    electronStore.set("BlockchainStoreDirName", chainDir);
  };

  const { routerStore } = useStores();
  return (
    <div>
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
          <Button type="submit">OK</Button>
        </form>
      </Container>
      <Button
        onClick={() => routerStore.goBack()}
        variant="contained"
        color="primary"
      >
        Return
      </Button>
      <br />
      <br />
    </div>
  );
};

export default ConfigurationView;
