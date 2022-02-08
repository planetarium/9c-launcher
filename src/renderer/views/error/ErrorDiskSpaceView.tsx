import React, { useEffect } from "react";
import errorViewStyle from "./ErrorView.style";
import { Typography } from "@material-ui/core";
import bytes from "bytes";
import { getBlockChainStorePath, REQUIRED_DISK_SPACE } from "../../../config";
import * as Sentry from "@sentry/electron";
import { T } from "@transifex/react";
import { ipcRenderer } from "electron";
import { observer } from "mobx-react";
import useStores from "src/hooks/useStores";

const transifexTags = "errorDiskSpace";

const isStateValid = (state: unknown): state is { size: number } => {
  return typeof state === "object" && state != null && "size" in state;
};

const ErrorDiskSpaceView = observer(() => {
  const classes = errorViewStyle();
  const { routerStore } = useStores();
  const size = isStateValid(routerStore.location.state)
    ? routerStore.location.state.size
    : REQUIRED_DISK_SPACE;

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/ErrorDiskSpace");
    Sentry.captureException(new Error("Disk space is not enough."));
  }, []);
  return (
    <div className={classes.root}>
      <Typography variant="h1" gutterBottom className={classes.title}>
        <T _str="Disk space is not enough." _tags={transifexTags} />
      </Typography>
      <Typography>
        <T
          _str="Required free space: {space}"
          _tags={transifexTags}
          space={bytes.format(Number(size), { unitSeparator: " " })}
        />
      </Typography>
      <Typography>
        <T
          _str="Root chain store path: {path}"
          _tags={transifexTags}
          path={getBlockChainStorePath()}
        />
      </Typography>
    </div>
  );
});

export default ErrorDiskSpaceView;
