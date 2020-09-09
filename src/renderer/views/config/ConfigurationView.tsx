import path from "path";

import { ipcRenderer } from "electron";
import React from "react";
import { observer } from "mobx-react";
import {
  Button,
  Container,
  TextField,
  FormLabel,
  Typography,
} from "@material-ui/core";
import { FolderOpen } from "@material-ui/icons";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { SettingsFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";
import { useLocale } from "../../i18n";
import Select from "../../components/Select";

type SupportLocales = Record<string, string>;

const ConfigurationView = observer(() => {
  const { routerStore } = useStores();

  const [rootChainPath, setRootChainPath] = React.useState<string>(
    blockchainStoreDirParent
  );

  const { locale, supportedLocales, selectedLocale } = useLocale(
    "configuration"
  );

  const classes = configurationViewStyle();
  const handleSubmit = (event: SettingsFormEvent) => {
    event.preventDefault();
    const chainDir = event.target.chain.value;
    electronStore.set("BlockchainStoreDirParent", rootChainPath);
    electronStore.set("BlockchainStoreDirName", chainDir);

    const localeName = SupportLocalesKeyValueSwap[event.target.select.value];
    electronStore.set("Locale", localeName);
  };

  const handleChangeDir = () => {
    const directory = ipcRenderer.sendSync("select-directory") as string[];
    setRootChainPath(path.join(...directory));
  };

  const SupportLocalesKeyValueSwap = Object.entries(supportedLocales).reduce(
    (previous, [key, value]) => {
      const newValue: SupportLocales = {};
      newValue[value] = key;
      return { ...previous, ...newValue };
    },
    {} as SupportLocales
  );

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
          <FormLabel>{locale("Root chain store path")}</FormLabel>
          <TextField
            fullWidth
            name="rootchain"
            className={classes.textField}
            value={rootChainPath}
            disabled
          />
          <Button
            onClick={handleChangeDir}
            variant="outlined"
            color="inherit"
            className={classes.selectDir}
            startIcon={<FolderOpen />}
          >
            {locale("Select path")}
          </Button>
          <FormLabel className={classes.newLine}>
            {locale("Chain store directory name")}
          </FormLabel>
          <TextField
            fullWidth
            name="chain"
            className={classes.textField}
            defaultValue={electronStore.get("BlockchainStoreDirName")}
          />
          <FormLabel>{locale("Select Language")}</FormLabel>
          <Select
            name="select"
            className={classes.selectLocale}
            items={Object.values(supportedLocales)}
            defaultValue={supportedLocales[selectedLocale] ?? "English"}
          />
          <FormLabel className={classes.label}>
            {locale(
              "Please restart the launcher to apply the updated settings."
            )}
          </FormLabel>
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
