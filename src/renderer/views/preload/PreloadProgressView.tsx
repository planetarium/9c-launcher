import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
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

import { useLocale } from "../../i18n";

const PreloadProgressView = observer(() => {
  const { accountStore, routerStore, standaloneStore } = useStores();
  const classes = preloadProgressViewStyle();
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  const [isPreloadEnded, setPreloadStats] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [aborted, setAborted] = useState(false);

  const [
    validateSnapshot,
    { loading, data, error },
  ] = useValidateSnapshotLazyQuery();

  const { locale } = useLocale("preloadProgress");

  useEffect(() => {
    ipcRenderer.on("not enough space on the disk", () => {
      gotoErrorPage("disk-space");
    });

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

    if (!ipcRenderer.sendSync("check disk permission")) {
      gotoErrorPage("no-permission");
      return;
    }

    const result = ipcRenderer.sendSync("check disk space");
    if (!result) {
      console.error("Disk space is not enough.");
      return;
    }

    ipcRenderer.sendSync("check standalone");

    // 여기서 스냅샷을 받을지 여부를 결정 가능
    if (electronStore.get("UseSnapshot")) {
      downloadSnapShot();
    } else {
      startPreloading();
    }
  }, []);

  useEffect(() => {
    if (undefined === error && !loading && data !== undefined) {
      if (data.validation.metadata) {
        const options: IDownloadOptions = {
          properties: {},
        };
        console.log("Snapshot is valid. Start downloading.");
        ipcRenderer.send("download snapshot", options);
      } else {
        console.log("Snapshot is invalid or redundant. Skip snapshot.");
        startPreloading();
      }
    }
  }, [data?.validation.metadata]);

  useEffect(() => {
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

  useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    setPreloadStats(isEnded === undefined ? false : isEnded);
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  useEffect(() => {
    standaloneStore.IsPreloadEnded = isPreloadEnded;
  }, [isPreloadEnded]);

  useEffect(() => {
    const prog = getProgress(
      preloadProgressSubscriptionResult?.preloadProgress?.extra.currentCount,
      preloadProgressSubscriptionResult?.preloadProgress?.extra.totalCount
    );
    setProgress(prog);
  }, [preloadProgress?.extra]);

  useEffect(() => {
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
            ? locale("Preload Completed.")
            : locale("No Peers Were Given.")}
        </Typography>
      ) : (
        <>
          <CircularProgress className={classes.circularProgress} size={12} />
          <Typography className={classes.text}>
            {locale(statusMessage[step])} ... ({step + 1}/8){" "}
            {Math.floor(progress)}%
          </Typography>
        </>
      )}
    </Container>
  );
});

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
