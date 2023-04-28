import React, { useCallback, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useActor } from "@xstate/react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router";
import { t } from "@transifex/native";
import ErrorContent from "./ErrorContent";
import { ipcRenderer, shell } from "electron";
import { T } from "src/renderer/i18n";
import Button from "src/renderer/components/ui/Button";
import Checkbox from "src/renderer/components/ui/Checkbox";
import bytes from "bytes";
import {
  getBlockChainStorePath,
  userConfigStore,
  app,
  installerUrl,
} from "src/config";
import { updateService } from "src/renderer/machines/updateMachine";

const transifexTags = "v2/ErrorView";

async function handleClearCache() {
  await ipcRenderer.invoke("clear cache", false);
  handleRestart();
}

function enableRemoteHeadless() {
  userConfigStore.set("UseRemoteHeadless", true);
  handleRestart();
}

function handleRestart() {
  app.relaunch();
  app.exit();
}

function ErrorView() {
  const { path } = useRouteMatch();
  const [state] = useActor(updateService);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleRestartClick = useCallback(() => {
    if (checkboxRef?.current?.checked) {
      shell.openExternal(installerUrl);
    }

    handleRestart();
  }, [checkboxRef]);

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to="/" />
      </Route>
      <Route path={`${path}/clear-cache`}>
        <ErrorContent
          title={t("Something went wrong.", { _tags: transifexTags })}
        >
          <T
            _str="Please press the button below to clear cache. The launcher will restart automatically."
            _tags={transifexTags}
          />
          <Button variant="primary" centered onClick={handleClearCache}>
            <T _str="Clear cache" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>
      <Route path={`${path}/disk-space`}>
        <ErrorContent
          title={t("Disk space is not enough", { _tags: transifexTags })}
        >
          <T
            _str="Nine Chronicles needs at least {space} to run. You may want to try enabling the 'Use Remote Headless' option in the settings."
            _tags={transifexTags}
            space={bytes.format(Number(state.context.data?.size ?? 0), {
              unitSeparator: " ",
            })}
          />
          <Button variant="primary" centered onClick={enableRemoteHeadless}>
            <T _str="Enable Remote Headless" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>

      <Route path={`${path}/download-binary-failed-disk-error`}>
        <ErrorContent
          title={t("Download binary failed", { _tags: transifexTags })}
        >
          {/* FIXME: Multi-language support is required. */}
          <>
            {`Not enough storage space to update the ${state.context.error}`}{" "}
            <br />
            {state.context.data?.size
              ? `You need a free space of ${bytes.format(
                  Number(state.context.data.size),
                  {
                    unitSeparator: " ",
                  }
                )}.`
              : ""}
          </>
          <Button variant="primary" centered onClick={handleRestart}>
            <T _str="Restart" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>

      <Route path={`${path}/download-binary-failed-error`}>
        <ErrorContent
          title={t("Download binary failed", { _tags: transifexTags })}
        >
          <T
            _str="Unable to connect. Please check your network connection."
            _tags={transifexTags}
          />
          <Button variant="primary" centered onClick={handleRestart}>
            <T _str="Restart" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>
      <Route path={`${path}/download-snapshot-failed-error`}>
        <ErrorContent
          title={t("Download snapshot failed", { _tags: transifexTags })}
        >
          <T
            _str="Unable to connect. Please check your network connection."
            _tags={transifexTags}
          />
          <Button variant="primary" centered onClick={handleRestart}>
            <T _str="Restart" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>
      <Route path={`${path}/download-snapshot-metadata-failed-error`}>
        <ErrorContent
          title={t("Download snapshot metadata failed", {
            _tags: transifexTags,
          })}
        >
          <T
            _str="Unable to connect. Please check your network connection."
            _tags={transifexTags}
          />
          <Button variant="primary" centered onClick={handleRestart}>
            <T _str="Restart" _tags={transifexTags} />
          </Button>
        </ErrorContent>
      </Route>
      <Route path={`${path}/no-permission`}>
        <ErrorContent title={t("No permission", { _tags: transifexTags })}>
          <T
            _str={
              "Application does not have permission at: {path}.\n\nPlease change chain directory by following steps below."
            }
            _tags={transifexTags}
            path={getBlockChainStorePath()}
          />
          <ol>
            <li>
              <T
                _str="Open SETTINGS page by clicking the button at the right side."
                _tags={transifexTags}
              />
            </li>
            <li>
              <T
                _str='Change \"Root chain store path\" by click \"SELECT PATH\" Button'
                _tags={transifexTags}
              />
            </li>
          </ol>
        </ErrorContent>
      </Route>
      <Route path={`${path}/reinstall`}>
        <ErrorContent title={t("Reinstall required", { _tags: transifexTags })}>
          <T _str="Please reinstall Nine Chronicles." _tags={transifexTags} />
          <Button variant="primary" centered onClick={handleRestartClick}>
            <T _str="Restart" _tags={transifexTags} />
          </Button>
          <Checkbox ref={checkboxRef}>
            <T _str="If you want reinstall?" _tags={transifexTags} />
          </Checkbox>
        </ErrorContent>
      </Route>
      <Route path={`${path}/relaunch`}>
        <ErrorContent title={t("Relaunch", { _tags: transifexTags })} />
      </Route>
    </Switch>
  );
}

export default observer(ErrorView);
