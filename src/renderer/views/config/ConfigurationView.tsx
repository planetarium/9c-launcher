import path from "path";

import { ipcRenderer, remote, shell } from "electron";
import React from "react";
import { observer } from "mobx-react";
import {
  Button,
  TextField,
  FormLabel,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormHelperText,
  IconButton,
} from "@material-ui/core";
import { FolderOpen, Close } from "@material-ui/icons";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { SettingsFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";
import { T, useLanguages, useLocale } from "@transifex/react";
import { Select } from "../../components/Select";
import ClearCacheButton from "../../components/ClearCacheButton";

const ConfigurationView = observer(() => {
  const { routerStore } = useStores();
  const languages: Array<Record<"code" | "name", string>> = useLanguages();
  const selectedLocale: string = useLocale();

  const [rootChainPath, setRootChainPath] = React.useState<string>(
    blockchainStoreDirParent
  );

  const classes = configurationViewStyle();
  const handleSubmit = (event: SettingsFormEvent) => {
    event.preventDefault();
    const chainDir = event.target.chain.value;
    electronStore.set("BlockchainStoreDirParent", rootChainPath);
    electronStore.set("BlockchainStoreDirName", chainDir);

    const localeName =
      languages.find((v) => v.name === event.target.select.value)?.code ?? "en";
    electronStore.set("Locale", localeName);

    const agreeAnalytic = event.target.analytic.checked;
    electronStore.set("Mixpanel", agreeAnalytic);

    const isEnableSentry = event.target.sentry.checked;
    electronStore.set("Sentry", isEnableSentry);

    remote.app.relaunch();
    remote.app.exit();
  };

  const handleChangeDir = () => {
    const directory = ipcRenderer.sendSync("select-directory") as
      | string[]
      | null;
    if (directory === null) return;
    setRootChainPath(path.join(...directory));
  };

  return (
    <div className={classes.root}>
      <header className={classes.titleWarp}>
        <Typography variant="h1" gutterBottom className={classes.title}>
          <T _str="Settings" _tags="configuration" />
        </Typography>
        <IconButton onClick={routerStore.goBack}>
          <Close />
        </IconButton>
      </header>
      <form onSubmit={handleSubmit}>
        <article className={classes.fields}>
          <FormLabel className={classes.line}>
            <T _str="Clear cache" _tags="configuration" />
          </FormLabel>
          <ClearCacheButton
            variant="outlined"
            color="inherit"
            className={classes.openPath}
          >
            <T _str="clear" _tags="configuration" />
          </ClearCacheButton>
          <FormLabel className={classes.newLine}>
            <T _str="Root chain store path" _tags="configuration" />
          </FormLabel>
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
            <T _str="Select path" _tags="configuration" />
          </Button>

          <FormLabel className={classes.newLine}>
            <T _str="Chain store directory name" _tags="configuration" />
          </FormLabel>
          <TextField
            fullWidth
            name="chain"
            className={classes.textField}
            defaultValue={electronStore.get("BlockchainStoreDirName")}
          />
          <FormLabel className={classes.newLine}>
            <T _str="Select Language" _tags="configuration" />
          </FormLabel>
          <Select
            name="select"
            className={classes.selectLocale}
            items={languages.map(({ name }) => name)}
            defaultValue={
              languages.find(({ code }) => code === selectedLocale)?.name ??
              "English"
            }
          />
          <FormLabel className={classes.newLine}>
            <T _str="Key store path" _tags="configuration" />
          </FormLabel>
          <Button
            onClick={handleOpenKeyStorePath}
            variant="outlined"
            color="inherit"
            className={classes.openPath}
            startIcon={<FolderOpen />}
          >
            <T _str="Open Path" _tags="configuration" />
          </Button>

          <FormControl className={classes.checkboxGroup}>
            <FormLabel className={classes.newLine}>
              <T _str="Send Information" _tags="configuration" />
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={electronStore.get("Sentry")}
                    color="default"
                    name="sentry"
                  />
                }
                label={<T _str="Report Error" _tags="configuration" />}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={electronStore.get("Mixpanel")}
                    color="default"
                    name="analytic"
                  />
                }
                label={<T _str="Behavior Analysis" _tags="configuration" />}
              />
            </FormGroup>
            <FormHelperText className={classes.checkboxHelper}>
              <T
                _str="These data is helpful for Game development."
                _tags="configuration"
              />
            </FormHelperText>
          </FormControl>
        </article>
        <Button
          type="submit"
          className={classes.submit}
          color="primary"
          variant="contained"
        >
          <T _str="Save" _tags="configuration" />
        </Button>
        <FormLabel className={classes.labelRelaunch}>
          <T
            _str="After saving, the launcher will restart."
            _tags="configuration"
          />
        </FormLabel>
      </form>
    </div>
  );
});

function handleOpenKeyStorePath() {
  const openpath = path.join(
    remote.app.getPath("appData"),
    "planetarium",
    "keystore"
  );
  console.log(`Open keystore folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

export default ConfigurationView;
