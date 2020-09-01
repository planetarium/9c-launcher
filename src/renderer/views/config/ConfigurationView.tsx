import * as React from "react";
import { observer } from "mobx-react";
import {
  Button,
  Container,
  TextField,
  FormLabel,
  Typography,
} from "@material-ui/core";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { RootChainFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";
import { useLocale } from "../../i18n";

const ConfigurationView = observer(() => {
  const { routerStore } = useStores();
  const locale = useLocale("configuration");

  const classes = configurationViewStyle();

  const handleSubmit = (event: RootChainFormEvent) => {
    event.preventDefault();
    const rootChainPath = event.target.rootchain.value;
    const chainDir = event.target.chain.value;
    electronStore.set("BlockchainStoreDirParent", rootChainPath);
    electronStore.set("BlockchainStoreDirName", chainDir);
  };

  return (
    <div className={classes.root}>
      <Button onClick={routerStore.goBack} className={classes.exit}>
        X
      </Button>
      <Container>
        <Typography variant="h1" gutterBottom className={classes.title}>
          {locale("Settings")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormLabel>Root chain store path</FormLabel>
          <TextField
            fullWidth
            name="rootchain"
            className={classes.textField}
            defaultValue={blockchainStoreDirParent}
          />
          <FormLabel>Chain store directory name</FormLabel>
          <TextField
            fullWidth
            name="chain"
            className={classes.textField}
            defaultValue={electronStore.get("BlockchainStoreDirName")}
          />
          <Button
            type="submit"
            className={classes.submit}
            color="primary"
            variant="contained"
          >
            {locale("Save")}
          </Button>
        </form>
      </Container>
      <br />
      <br />
    </div>
  );
});

export default ConfigurationView;
