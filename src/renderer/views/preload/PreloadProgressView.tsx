import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import mixpanel from "mixpanel-browser";
import { ipcRenderer, IpcRendererEvent } from "electron";
import useStores from "../../../hooks/useStores";
import { Container, Typography, CircularProgress } from "@material-ui/core";
import {
  useNodeExceptionSubscription,
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";
import preloadProgressViewStyle from "./PreloadProgressView.style";
import { electronStore } from "../../../config";

import { useLocale } from "../../i18n";
import { PreloadProgress } from "../../../interfaces/i18n";
import { IDownloadProgress } from "../../../interfaces/ipc";

const PreloadProgressView = observer(() => {
  const { routerStore, standaloneStore } = useStores();
  const classes = preloadProgressViewStyle();
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const {
    data: nodeExceptionSubscriptionResult,
  } = useNodeExceptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  const [isPreloadEnded, setPreloadStats] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const { locale } = useLocale<PreloadProgress>("preloadProgress");

  useEffect(() => {
    ipcRenderer.on("go to error page", (event: IpcRendererEvent, args: any[]) => {
      if (args.length !== 1) {
        console.error("Number of argument of 'go to error page' should be 1.");
        return;
      }

      gotoErrorPage(args[0]);
    });

    ipcRenderer.on("standalone exited", () => {
      gotoErrorPage("reinstall");
    });

    ipcRenderer.on("start bootstrap", () => {
      standaloneStore.setReady(false);
      setPreloadStats(false);
      setProgress(0);
      setStep(0);
    });

    ipcRenderer.on("metadata downloaded", () => {
      console.log("Metadata downloded. Verifying...");
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

    ipcRenderer.on(
      "extract progress",
      (event: IpcRendererEvent, progress: number) => {
        setStep(2);
        setProgress(progress * 100);
      }
    );

    ipcRenderer.on("extract complete", (event: IpcRendererEvent) => {
      // snapshot extraction completed, but node service did not launched yet.
    });

    //@ts-ignore
    window.relaunchStandalone = () => ipcRenderer.send("relaunch standalone");
  }, []);

  useEffect(() => {
    mixpanel.track(`Launcher/${statusMessage[step]}`);
  }, [step]);

  const gotoErrorPage = (page: string) => {
    standaloneStore.setReady(false);
    routerStore.push(`/error/${page}`);
  };

  useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    setPreloadStats(isEnded === undefined ? false : isEnded);
    if (isEnded) {
      standaloneStore.setReady(true);
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  useEffect(() => {
    const code = nodeExceptionSubscriptionResult?.nodeException?.code;
    switch (code) {
      case 0x01:
        console.error("No any peers. Redirect to relaunch page.");
        gotoErrorPage("relaunch");
        break;
      case 0x02:
        console.error("Chain is too low. Automatically relaunch.");
        ipcRenderer.send("relaunch standalone");
        break;
      case 0x03:
        console.error("Chain's tip is stale. Automatically relaunch.");
        ipcRenderer.send("relaunch standalone");
        break;
      case 0x04:
        console.error(
          "Haven't received any messages for some time. Automatically relaunch."
        );
        ipcRenderer.send("relaunch standalone");
        break;
      case 0x05:
        console.error("Action Timeout. Automatically relaunch.");
        ipcRenderer.send("relaunch standalone");
        break;
    }
  }, [nodeExceptionSubscriptionResult?.nodeException?.code]);

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
      {isPreloadEnded ? (
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
            {step > 2 ? (
              <small className={classes.blockCount}>
                [
                {
                  preloadProgressSubscriptionResult?.preloadProgress?.extra
                    .totalCount
                }
                ]
              </small>
            ) : (
              <></>
            )}
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
] as const;

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default PreloadProgressView;
