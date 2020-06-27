import * as React from "react";
import { useState } from "react";
import { LinearProgress, Button } from "@material-ui/core";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../interfaces/store";
import DownloadSnapshotButton from "../components/DownloadSnapshotButton";
import ClearCacheButton from "../components/ClearCacheButton";

const ConfigurationView = observer(
  ({ accountStore, routerStore }: IStoreContainer) => {
    const [isDownloading, setDownloadState] = useState(false);
    const [isExtracting, setExtractState] = useState(false);
    const [progress, setProgress] = useState(0);
    const isDisable = isDownloading || isExtracting;

    return (
      <div>
        <Button
          disabled={isDisable}
          onClick={() => routerStore.push("/")}
          variant="contained"
          color="primary"
        >
          Back to Home
        </Button>
        <br />
        <DownloadSnapshotButton
          disabled={isDisable}
          setExtractState={setExtractState}
          setDownloadState={setDownloadState}
          progress={progress}
          setProgress={setProgress}
        />
        <br />
        <ClearCacheButton disabled={isDisable} />
        <br />
        {isDownloading || isExtracting ? (
          <LinearProgress variant="determinate" value={progress} />
        ) : null}
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(ConfigurationView);
