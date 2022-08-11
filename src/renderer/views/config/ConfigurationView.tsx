import path from "path";

import { ipcRenderer, shell } from "electron";
import { app } from "@electron/remote";
import React, { useMemo } from "react";
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
import {
  userConfigStore,
  get as getConfig,
  blockchainStoreDirParent,
} from "../../../config";
import { SettingsFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";
import { T, useLanguages, useLocale } from "@transifex/react";
import { Select } from "../../components/Select";
import ClearCacheButton from "../../components/ClearCacheButton";
import log from "electron-log";
import bytes from "bytes";

const transifexTags = "configuration";

const ConfigurationView = observer(() => {
  const { routerStore } = useStores();
  const languages: Array<Record<"code" | "name" | "localized_name", string>> =
    useLanguages();
  const selectedLocale: string = useLocale();
  const selectedLanguage = useMemo(
    () => languages.find(({ code }) => code === selectedLocale)?.localized_name,
    [languages, selectedLocale]
  );

  const [rootChainPath, setRootChainPath] = React.useState<string>(
    blockchainStoreDirParent
  );

  const classes = configurationViewStyle();
  const handleSubmit = (event: SettingsFormEvent) => {
    event.preventDefault();
    const chainDir = event.target.chain.value;
    userConfigStore.set("BlockchainStoreDirParent", rootChainPath);
    userConfigStore.set("BlockchainStoreDirName", chainDir);

    const localeName =
      languages.find((v) => v.localized_name === event.target.select.value)
        ?.code ?? "en";
    userConfigStore.set("Locale", localeName);

    const agreeAnalytic = event.target.analytic.checked;
    userConfigStore.set("Mixpanel", agreeAnalytic);

    const isEnableSentry = event.target.sentry.checked;
    userConfigStore.set("Sentry", isEnableSentry);

    const useRemoteHeadlessChecked = event.target.useRemoteHeadless.checked;
    userConfigStore.set("UseRemoteHeadless", useRemoteHeadlessChecked);

    const useLegacyChecked = event.target.v2.checked;
    if (useLegacyChecked)
      userConfigStore.set("PreferLegacyInterface", useLegacyChecked);
    else userConfigStore.delete("PreferLegacyInterface");

    const logSize = bytes.parse(event.target.logsize.value);
    if (logSize && logSize !== getConfig("LogSizeBytes"))
      userConfigStore.set("LogSizeBytes", logSize);

    app.relaunch();
    app.exit();
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
          <T _str="Settings" _tags={transifexTags} />
        </Typography>
        <IconButton onClick={routerStore.goBack}>
          <Close />
        </IconButton>
      </header>
      <form onSubmit={handleSubmit}>
        <article className={classes.fields}>
          <FormLabel className={classes.line}>
            <T _str="Clear cache" _tags={transifexTags} />
          </FormLabel>
          <ClearCacheButton
            variant="outlined"
            color="inherit"
            className={classes.openPath}
          >
            <T _str="clear" _tags={transifexTags} />
          </ClearCacheButton>
          <FormLabel className={classes.newLine}>
            <T _str="Root chain store path" _tags={transifexTags} />
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
            <T _str="Select path" _tags={transifexTags} />
          </Button>

          <FormLabel className={classes.newLine}>
            <T _str="Chain store directory name" _tags={transifexTags} />
          </FormLabel>
          <TextField
            fullWidth
            name="chain"
            className={classes.textField}
            defaultValue={getConfig("BlockchainStoreDirName")}
          />
          <FormLabel className={classes.newLine}>
            <T _str="Select Language" _tags={transifexTags} />
          </FormLabel>
          {languages.length > 0 && (
            <Select
              name="select"
              className={classes.selectLocale}
              items={languages.map(({ localized_name }) => localized_name)}
              defaultValue={selectedLanguage ?? "English"}
            />
          )}
          <FormLabel className={classes.newLine}>
            <T _str="Key store path" _tags={transifexTags} />
          </FormLabel>
          <Button
            onClick={handleOpenKeyStorePath}
            variant="outlined"
            color="inherit"
            className={classes.openPath}
            startIcon={<FolderOpen />}
          >
            <T _str="Open Path" _tags={transifexTags} />
          </Button>

          <FormLabel className={classes.newLine}>
            <T _str="Log path" _tags={transifexTags} />
          </FormLabel>
          <Button
            onClick={handleOpenLogPath}
            variant="outlined"
            color="inherit"
            className={classes.openPath}
            startIcon={<FolderOpen />}
          >
            <T _str="Open Path" _tags={transifexTags} />
          </Button>

          <FormLabel className={classes.newLine}>
            <T _str="Log Size" _tags={transifexTags} />
          </FormLabel>
          <TextField
            fullWidth
            name="logsize"
            className={classes.textField}
            defaultValue={bytes(getConfig("LogSizeBytes"))}
          />

          <FormControl className={classes.checkboxGroup}>
            <FormLabel className={classes.newLine}>
              <T _str="Send Information" _tags={transifexTags} />
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={getConfig("Sentry")}
                    color="default"
                    name="sentry"
                  />
                }
                label={<T _str="Report Error" _tags={transifexTags} />}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={getConfig("Mixpanel")}
                    color="default"
                    name="analytic"
                  />
                }
                label={<T _str="Behavior Analysis" _tags={transifexTags} />}
              />
            </FormGroup>
            <FormHelperText className={classes.checkboxHelper}>
              <T
                _str="These data is helpful for Game development."
                _tags={transifexTags}
              />
            </FormHelperText>
          </FormControl>

          <FormControl className={classes.checkboxGroup}>
            <FormLabel className={classes.newLine}>
              <T _str="Connection" _tags={transifexTags} />
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={getConfig("UseRemoteHeadless")}
                    color="default"
                    name="useRemoteHeadless"
                  />
                }
                label={<T _str="Use Remote Headless" _tags={transifexTags} />}
              />
            </FormGroup>
          </FormControl>
          <FormControl className={classes.checkboxGroup}>
            <FormLabel className={classes.newLine}>
              <T _str="Debugging" _tags={transifexTags} />
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    defaultChecked={getConfig("PreferLegacyInterface")}
                    color="default"
                    name="v2"
                  />
                }
                label={
                  <T _str="Prefer Legacy Interface" _tags={transifexTags} />
                }
              />
            </FormGroup>
            <FormHelperText className={classes.checkboxHelper}>
              <T
                _str="If you have time to do so please report your issues on Discord so we can work on it!"
                _tags={transifexTags}
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
          <T _str="Save" _tags={transifexTags} />
        </Button>
        <FormLabel className={classes.labelRelaunch}>
          <T
            _str="After saving, the launcher will restart."
            _tags={transifexTags}
          />
        </FormLabel>
      </form>
    </div>
  );
});

function handleOpenKeyStorePath() {
  const openpath = path.join(app.getPath("appData"), "planetarium", "keystore");
  console.log(`Open keystore folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

function handleOpenLogPath() {
  const openpath = log.transports.file.getFile().path;
  console.log(`Open log folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

export default ConfigurationView;
