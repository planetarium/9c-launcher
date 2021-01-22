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
import { useLocale } from "../../i18n";
import { Select } from "../../components/Select";
import { Configuration } from "../../../interfaces/i18n";
import ClearCacheButton from "../../components/ClearCacheButton";

const ConfigurationView = observer(() => {
  const { routerStore } = useStores();

  const [rootChainPath, setRootChainPath] = React.useState<string>(
    blockchainStoreDirParent
  );

  const { locale, supportedLocales, selectedLocale } = useLocale<Configuration>(
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
      <header className={classes.titleWarp}>
        <Typography variant="h1" gutterBottom className={classes.title}>
          {locale("설정")}
        </Typography>
        <IconButton onClick={routerStore.goBack}>
          <Close />
        </IconButton>
      </header>
      <form onSubmit={handleSubmit}>
        <article className={classes.fields}>
          <FormLabel className={classes.line}>
            {locale("캐시 비우기")}
          </FormLabel>
          <ClearCacheButton
            variant="outlined"
            color="inherit"
            className={classes.openPath}
          >
            {locale("비우기")}
          </ClearCacheButton>
          <FormLabel className={classes.newLine}>
            {locale("체인이 저장되는 경로")}
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
            {locale("경로 선택")}
          </Button>

          <FormLabel className={classes.newLine}>
            {locale("체인 폴더의 이름")}
          </FormLabel>
          <TextField
            fullWidth
            name="chain"
            className={classes.textField}
            defaultValue={electronStore.get("BlockchainStoreDirName")}
          />
          <FormLabel className={classes.newLine}>
            {locale("언어 선택")}
          </FormLabel>
          <Select
            name="select"
            className={classes.selectLocale}
            items={Object.values(supportedLocales)}
            defaultValue={supportedLocales[selectedLocale] ?? "English"}
          />
          <FormLabel className={classes.newLine}>
            {locale("키 저장 경로")}
          </FormLabel>
          <Button
            onClick={handleOpenKeyStorePath}
            variant="outlined"
            color="inherit"
            className={classes.openPath}
            startIcon={<FolderOpen />}
          >
            {locale("경로 열기")}
          </Button>

          <FormControl className={classes.checkboxGroup}>
            <FormLabel className={classes.newLine}>
              {locale("정보 수집")}
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
                label={locale("오류 보고")}
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
                label={locale("행동 분석")}
              />
            </FormGroup>
            <FormHelperText className={classes.checkboxHelper}>
              {locale("두 데이터는 게임 개발에 도움이 됩니다.")}
            </FormHelperText>
          </FormControl>
        </article>
        <Button
          type="submit"
          className={classes.submit}
          color="primary"
          variant="contained"
        >
          {locale("저장")}
        </Button>
        <FormLabel className={classes.labelRelaunch}>
          {locale("저장 후 론처가 재시작 됩니다.")}
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
