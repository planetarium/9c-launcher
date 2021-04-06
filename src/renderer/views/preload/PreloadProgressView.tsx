import { Container, Typography, CircularProgress } from "@material-ui/core";
import { observer } from "mobx-react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import React, { useState, useEffect } from "react";
import { electronStore } from "../../../config";
import {
  useNodeExceptionSubscription,
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { PreloadProgress } from "../../../interfaces/i18n";
import { IDownloadProgress } from "../../../interfaces/ipc";
import { useLocale } from "../../i18n";
import preloadProgressViewStyle from "./PreloadProgressView.style";

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

  const [preloadEnded, setPreloadEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | string[]>("");
  const [exceptionMessage, setExceptionMessage] = useState<string | null>(null);
  const { locale } = useLocale<PreloadProgress>("preloadProgress");

  const gotoErrorPage = (page: string) => {
    console.log(`Direct to error page: ${page}`);
    standaloneStore.setReady(false);
    routerStore.push(`/error/${page}`);
  };

  const makeProgressMessage = () => {
    if (preloadEnded) {
      return electronStore.get("PeerStrings").length > 0
        ? locale("Preload Completed.")
        : locale("No Peers Were Given.");
    } else {
      return locale(statusMessage[step]).concat(
        ` ... (${step + 1}/8) ${Math.floor(progress)}%`
      );
    }
  };

  useEffect(() => {
    ipcRenderer.on(
      "go to error page",
      (event: IpcRendererEvent, arg: string) => {
        gotoErrorPage(arg);
      }
    );

    ipcRenderer.on("start bootstrap", () => {
      standaloneStore.setReady(false);
      setPreloadEnded(false);
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

    ipcRenderer.on(
      "set exception message of PreloadProgressView",
      (event, exceptionMessage: string | null) => {
        setExceptionMessage(exceptionMessage);
      }
    );

    //@ts-ignore
    window.relaunchStandalone = () => ipcRenderer.send("relaunch standalone");
  }, []);

  useEffect(() => {
    ipcRenderer.send("mixpanel-track-event", `Launcher/${statusMessage[step]}`);
  }, [step]);

  useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    setPreloadEnded(isEnded === undefined ? false : isEnded);

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

  useEffect(() => {
    if (preloadEnded) {
      ipcRenderer.send("mixpanel-track-event", `Launcher/Preload Completed`);
    }
  }, [preloadEnded]);

  useEffect(
    () => setProgressMessage(makeProgressMessage()),
    [preloadEnded, step, progress]);

  const message =
    exceptionMessage === null ? progressMessage : exceptionMessage;
  return (
    <Container className="footer">
      {preloadEnded ? (
        <Typography className={classes.text}>{message}</Typography>
      ) : (
        <>
          <CircularProgress className={classes.circularProgress} size={12} />
          <Typography className={classes.text}>
            {message}
            {exceptionMessage === null && step > 2 ? (
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
