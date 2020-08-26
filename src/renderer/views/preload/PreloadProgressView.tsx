import React from "react";
import mixpanel from "mixpanel-browser";
import { ipcRenderer, IpcRendererEvent } from "electron";
import useStores from "../../../hooks/useStores";
import { Container, Typography, CircularProgress } from "@material-ui/core";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
  useValidateSnapshotLazyQuery,
} from "../../../generated/graphql";
import preloadProgressViewStyle from "./PreloadProgressView.style";
import { electronStore } from "../../../config";

const PreloadProgressView = () => {
  const { accountStore, routerStore, standaloneStore } = useStores();
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
  const [step, setStep] = React.useState(0);
  const [aborted, setAborted] = React.useState(false);

  const [
    validateSnapshot,
    { loading, data, error },
  ] = useValidateSnapshotLazyQuery();

  React.useEffect(() => {
    ipcRenderer.on("standalone exited", () => {
      // Standalone exited abnormally. This indicates that
      // standalone has different version, or the genesis block
      // is invalid. Mainly something broken in config.json.
      gotoErrorPage("reinstall");
    });

    ipcRenderer.on("metadata downloaded", (_, meta) => {
      console.log("Metadata downloded. Verifying...");
      validateSnapshot({ variables: { raw: meta } });
      // returns true iff snapshot need to be downloaded
    });

    ipcRenderer.on(
      "download progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setStep(1);
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("download complete", (_, path: string) => {
      // download completed...
    });

    ipcRenderer.on("extract progress", (event, progress) => {
      setStep(2);
      setProgress(progress * 100);
    });

    ipcRenderer.on("extract complete", (event) => {
      // snapshot extraction completed, but node service did not launched yet.
    });

    ipcRenderer.on("snapshot complete", (event) => {
      console.log("Snapshot extraction completed. Start IBD.");
      startPreloading();
    });

    ipcRenderer.send("check standalone");

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

  React.useEffect(() => {
    mixpanel.track(`Launcher/${statusMessage[step]}`);
  }, [step]);

  const downloadSnapShot = () => {
    const options: IDownloadOptions = {
      properties: {},
    };
    ipcRenderer.send("download metadata", options);
  };

  const startPreloading = () => {
    mixpanel.track("Launcher/IBD Start");
    standaloneStore
      .runStandalone()
      .then(() => {
        if (accountStore.isLogin && accountStore.privateKey !== "") {
          return standaloneStore.setPrivateKey(accountStore.privateKey);
        }
      })
      .then(() => {
        if (accountStore.isLogin && accountStore.privateKey !== "") {
          return standaloneStore.setMining(standaloneStore.NoMiner);
        }
      })
      .catch((error) => {
        console.log(error);
        gotoErrorPage("relaunch");
      });
  };

  const gotoErrorPage = (page: string) => {
    standaloneStore.abort();
    setAborted(true);
    routerStore.push(`/error/${page}`);
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
      const phase = preloadProgress?.extra.type;

      if (
        electronStore.get("PeerStrings").length > 0 &&
        (phase === undefined ||
          (phase !== "ActionExecutionState" && phase !== "StateDownloadState"))
      ) {
        gotoErrorPage("relaunch");
      }
    }
  }, [isPreloadEnded, preloadProgress?.extra]);

  React.useEffect(() => {
    if (preloadProgress !== undefined) {
      setStep(preloadProgress?.currentPhase + 2);
    }
  }, [preloadProgress]);

  return (
    <Container className="footer">
      {aborted ? (
        <></>
      ) : isPreloadEnded ? (
        <Typography className={classes.text}>
          {electronStore.get("PeerStrings").length > 0
            ? "Preload Completed."
            : "No Peers Were Given."}
        </Typography>
      ) : (
        <>
          <CircularProgress className={classes.circularProgress} size={12} />
          <Typography className={classes.text}>
            {statusMessage[step]} ... ({step + 1}/8) {Math.floor(progress)}%
          </Typography>
        </>
      )}
    </Container>
  );
};

const statusMessage = [
  "Validating Snapshot",
  "Downloading Snapshot",
  "Extracting Snapshot",
  "Downloading block hashes",
  "Downloading blocks",
  "Verifying block headers",
  "Downloading states",
  "Executing actions",
];

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default PreloadProgressView;
