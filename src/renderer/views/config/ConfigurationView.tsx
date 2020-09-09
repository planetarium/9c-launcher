import path from "path";

import { ipcRenderer, remote } from "electron";
import React from "react";
import { observer } from "mobx-react";
import {
  Button,
  Container,
  TextField,
  FormLabel,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormHelperText,
} from "@material-ui/core";
import { FolderOpen } from "@material-ui/icons";
import useStores from "../../../hooks/useStores";
import { electronStore, blockchainStoreDirParent } from "../../../config";
import { SettingsFormEvent } from "../../../interfaces/event";
import configurationViewStyle from "./ConfigurationView.style";
import { useLocale } from "../../i18n";
import { Select } from "../../components/Select";

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

    const agreeAnalytic = event.target.analytic.checked;
    electronStore.set("Mixpanel", agreeAnalytic);

    const isEnableSentry = event.target.sentry.checked;
    electronStore.set("Sentry", isEnableSentry);

    remote.app.relaunch();
    remote.app.exit();
  };

  const handleChangeDir = () => {
    const directory = ipcRenderer.sendSync("select-directory") as string[];
    setRootChainPath(path.join(...directory));
  };

  const SupportLocalesKeyValueSwap = Object.entries(supportedLocales).reduce(
    (pre, [key, value]) => {
      pre[value] = key;
      return pre;
    },
    {} as Record<string, string>
  );

  return (
    <div className={classes.root}>
      <section className={classes.titleWarp}>
        <Typography variant="h1" gutterBottom className={classes.title}>
          {locale("Settings")}
        </Typography>
        <Button onClick={routerStore.goBack} className={classes.exit}>
          X
        </Button>
      </section>
      <form onSubmit={handleSubmit}>
        <article className={classes.fields}>
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
          <FormControl className={classes.checkboxGroup}>
            <FormLabel>{locale("Send Information")}</FormLabel>
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
                label={locale("Report Error")}
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
                label={locale("Behavior Analytic")}
              />
            </FormGroup>
            <FormHelperText className={classes.checkboxHelper}>
              {locale("These data are helpful for Game development.")}
            </FormHelperText>
          </FormControl>
        </article>
        <Button
          type="submit"
          className={classes.submit}
          color="primary"
          variant="contained"
        >
          {locale("Save")}
        </Button>
        <FormLabel className={classes.label}>
          {locale("After saving, the launcher will restart.")}
        </FormLabel>
      </form>
    </div>
  );
});

export default ConfigurationView;
