import React from "react";
import mixpanel from "mixpanel-browser";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, Typography, CircularProgress } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
  useValidateSnapshotLazyQuery,
} from "../../../generated/graphql";
import preloadProgressViewStyle from "./PreloadProgressView.style";
import { electronStore } from "../../../config";
import { RouterStore } from "mobx-react-router";

enum PreloadProgressPhase {
  ActionExecutionState,
  BlockDownloadState,
  BlockHashDownloadState,
  BlockVerificationState,
  StateDownloadState,
}

const PreloadProgressView = observer((props: IStoreContainer) => {
  const { routerStore, standaloneStore } = props;
  const classes = preloadProgressViewStyle();
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  const [isPreloadEnded, setPreloadStats] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [step, setStep] = React.useState(1);

  const [
    validateSnapshot,
    { loading, data, error },
  ] = useValidateSnapshotLazyQuery();

  React.useEffect(() => {
    ipcRenderer.on("metadata downloaded", (_, meta) => {
      console.log("Metadata downloded. Verifying...");
      validateSnapshot({ variables: { raw: meta } });
      // returns true iff snapshot need to be downloaded
    });

    ipcRenderer.on(
      "download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setStep(2);
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("download complete", (_, path: string) => {
      // download completed...
    });

    ipcRenderer.on("extract progress", (event, progress) => {
      setStep(3);
      setProgress(progress * 100);
    });

    ipcRenderer.on("extract complete", (event) => {
      // snapshot extraction completed, but node service did not launched yet.
    });

    ipcRenderer.on("snapshot complete", (event) => {
      console.log("Snapshot extraction completed. Start IBD.");
      startPreloading();
    });

    // 여기서 스냅샷을 받을지 여부를 결정 가능
    if (electronStore.get("UseSnapshot")) {
      downloadSnapShot();
    } else {
      startPreloading();
    }
  }, []);

  React.useEffect(() => {
    if (undefined === error && !loading && data !== undefined) {
      if (data.validation.metadata) {
        const options: IDownloadOptions = {
          properties: {},
        };
        console.log("Snapshot is valid. Start downloading.");
        ipcRenderer.send("download snapshot", options);
      } else {
        console.log("Snapshot is invalid or redundent. Skip snapshot.");
        startPreloading();
      }
    }
  }, [data?.validation.metadata]);

  const downloadSnapShot = () => {
    const options: IDownloadOptions = {
      properties: {},
    };
    ipcRenderer.send("download metadata", options);
  };

  const startPreloading = () => {
    mixpanel.track("Launcher/IBD Start");
    standaloneStore.runStandalone().catch((error) => {
      console.log(error);
      routerStore.push("/error");
    });
  };

  React.useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    setPreloadStats(isEnded === undefined ? false : isEnded);
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  React.useEffect(() => {
    standaloneStore.IsPreloadEnded = isPreloadEnded;
  }, [isPreloadEnded]);

  React.useEffect(() => {
    const prog = getProgress(
      preloadProgressSubscriptionResult?.preloadProgress?.extra.currentCount,
      preloadProgressSubscriptionResult?.preloadProgress?.extra.totalCount
    );
    setProgress(prog);
  }, [preloadProgress?.extra]);

  React.useEffect(() => {
    if (isPreloadEnded) {
      const phase: PreloadProgressPhase =
        PreloadProgressPhase[preloadProgress?.extra.type];

      if (
        phase !== PreloadProgressPhase.ActionExecutionState &&
        phase !== PreloadProgressPhase.StateDownloadState &&
        electronStore.get("PeerStrings").length > 0
      ) {
        routerStore.push("/error");
      }
    }
  }, [isPreloadEnded, preloadProgress?.extra]);

  React.useEffect(() => {
    if (preloadProgress !== undefined) {
      setStep(preloadProgress?.currentPhase + 3);
    }
  }, [preloadProgress]);

  return (
    <Container className="footer">
      {isPreloadEnded ? (
        <Typography className={classes.text}>Preload Completed.</Typography>
      ) : (
        <>
          <CircularProgress className={classes.circularProgress} size={12} />
          <Typography className={classes.text}>
            {getStatusMessage(step)} ({step}/8) {Math.floor(progress)}%
          </Typography>
        </>
      )}
    </Container>
  );
});

const getStatusMessage = (step: number) => {
  switch (step) {
    case 1:
      return "Validating Snapshot...";

    case 2:
      return "Downloading Snapshot...";

    case 3:
      return "Extracting Snapshot...";

    case 4:
      return "Verifying block headers...";

    case 5:
      return "Downloading block hashes...";

    case 6:
      return "Downloading blocks...";

    case 7:
      return "Downloading states...";

    case 8:
      return "Executing actions...";

    default:
      return `Error occurred ${step}`;
  }
};

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default inject("routerStore", "standaloneStore")(PreloadProgressView);
