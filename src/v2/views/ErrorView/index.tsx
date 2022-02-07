import React from "react";
import { observer } from "mobx-react";
import { preloadService } from "../../machines/preloadMachine";
import { useActor } from "@xstate/react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router";
import { t } from "@transifex/native";
import ErrorContent from "./ErrorContent";

const transifexTags = "v2/ErrorView";

function ErrorView() {
  let { path } = useRouteMatch();
  const [state] = useActor(preloadService);

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to="/" />
      </Route>
      <Route path={`${path}/clear-cache`}>
        <ErrorContent title={t("Clear cache", { _tags: transifexTags })} />
      </Route>
      <Route path={`${path}/disk-space`}>
        <ErrorContent title={t("Disk space", { _tags: transifexTags })} />
      </Route>
      <Route path={`${path}/download-binary-failed-error`}>
        <ErrorContent
          title={t("Download binary failed", { _tags: transifexTags })}
        />
      </Route>
      <Route path={`${path}/download-snapshot-failed-error`}>
        <ErrorContent
          title={t("Download snapshot failed", { _tags: transifexTags })}
        />
      </Route>
      <Route path={`${path}/download-snapshot-metadata-failed-error`}>
        <ErrorContent
          title={t("Download snapshot metadata failed", {
            _tags: transifexTags,
          })}
        />
      </Route>
      <Route path={`${path}/no-permission`}>
        <ErrorContent title={t("No permission", { _tags: transifexTags })} />
      </Route>
      <Route path={`${path}/reinstall`}>
        <ErrorContent title={t("Reinstall", { _tags: transifexTags })} />
      </Route>
      <Route path={`${path}/relaunch`}>
        <ErrorContent title={t("Relaunch", { _tags: transifexTags })} />
      </Route>
    </Switch>
  );
}

export default observer(ErrorView);
