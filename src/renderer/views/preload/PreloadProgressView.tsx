import { Container, Typography, CircularProgress } from "@material-ui/core";
import { observer } from "mobx-react";
import { ipcRenderer, IpcRendererEvent } from "electron";
import React, { useState, useEffect } from "react";
import { get as getConfig } from "../../../config";
import {
  useNodeExceptionSubscription,
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { IDownloadProgress } from "../../../interfaces/ipc";
import { useT } from "@transifex/react";
import { t } from "@transifex/native";
import preloadProgressViewStyle from "./PreloadProgressView.style";

const PreloadProgressView = observer(() => {
  const { routerStore, standaloneStore } = useStores();
  const classes = preloadProgressViewStyle();
  const { data: preloadProgressSubscriptionResult } =
    usePreloadProgressSubscriptionSubscription();
  const { data: nodeStatusSubscriptionResult } =
    useNodeStatusSubscriptionSubscription();
  const { data: nodeExceptionSubscriptionResult } =
    useNodeExceptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  const [preloadEnded, setPreloadEnded] = useState(false);
  const [totalStep] = useState(10);
  const [currentStep, setCurrentStep] = useState(0);
  const [startingHeadlessStep] = useState(5);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | string[]>("");
  const [exceptionMessage, setExceptionMessage] = useState<string | null>(null);

  const gotoErrorPage = (page: string, meta?: Record<string, any>) => {
    console.log(`Direct to error page: ${page}`);
    standaloneStore.setReady(false);
    routerStore.push(`/error/${page}`, meta);
  };

  const getCurrentStepStatusMessage = () => {
    if (!(0 < currentStep && currentStep <= statusMessage.length)) {
      return Array(2).fill("Initializing background process..");
    }

    return statusMessage[currentStep - 1];
  };

  const completedMessage = useT("Preload Completed.", {
    _tags: "preloadProgress",
  });
  const noPeerMessage = useT("No Peers Were Given.", {
    _tags: "preloadProgress",
  });

  const makeProgressMessage = () => {
    if (preloadEnded) {
      return getConfig("PeerStrings").length > 0
        ? completedMessage
        : noPeerMessage;
    } else {
      return getCurrentStepStatusMessage()[1].concat(
        ` ... (${currentStep}/${totalStep}) ${Math.floor(progress)}%`
      );
    }
  };

  useEffect(() => {
    ipcRenderer.on(
      "go to error page",
      (event: IpcRendererEvent, arg: string, meta?: Record<string, any>) => {
        gotoErrorPage(arg, meta);
      }
    );

    ipcRenderer.on("start bootstrap", () => {
      standaloneStore.setReady(false);
      setPreloadEnded(false);
      setProgress(0);
      setCurrentStep(1);
    });

    ipcRenderer.on("metadata downloaded", () => {
      console.log("Metadata downloded. Verifying...");
    });

    ipcRenderer.on(
      "download snapshot progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setCurrentStep(2);
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on(
      "download state snapshot progress",
      (event: IpcRendererEvent, progress: IDownloadProgress) => {
        setCurrentStep(3);
        setProgress(progress.percent * 100);
      }
    );

    ipcRenderer.on("download complete", (_, path: string) => {
      // download completed...
    });

    ipcRenderer.on(
      "extract progress",
      (event: IpcRendererEvent, progress: number) => {
        setCurrentStep(4);
        setProgress(progress * 100);
      }
    );

    ipcRenderer.on("extract complete", (event: IpcRendererEvent) => {
      // snapshot extraction completed, but node service did not launched yet.
    });

    ipcRenderer.on("start headless", (event: IpcRendererEvent) => {
      setCurrentStep(startingHeadlessStep);
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
    if (standaloneStore.Ready) return; // standalone ready implies the preload has been completed before, and we don't really need events after that
    ipcRenderer.send(
      "mixpanel-track-event",
      `Launcher/${getCurrentStepStatusMessage()[0]}`
    );
  }, [currentStep]);

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
        ipcRenderer.send("relaunch standalone", { reason: "Tip is low." });
        break;
      case 0x03:
        console.error("Chain's tip is stale. Automatically relaunch.");
        ipcRenderer.send("relaunch standalone", { reason: "Tip is stale." });
        break;
      case 0x04:
        console.error(
          "Haven't received any messages for some time. Automatically relaunch."
        );
        ipcRenderer.send("relaunch standalone", {
          reason: "Haven't received message.",
        });
        break;
      case 0x05:
        console.error("Action Timeout. Automatically relaunch.");
        ipcRenderer.send("relaunch standalone", { reason: "Action Timeout." });
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
      setCurrentStep(preloadProgress?.currentPhase + startingHeadlessStep);
    }
  }, [preloadProgress]);

  useEffect(() => {
    if (preloadEnded) {
      ipcRenderer.send("mixpanel-track-event", `Launcher/Preload Completed`);
    }
  }, [preloadEnded]);

  useEffect(
    () => setProgressMessage(makeProgressMessage()),
    [preloadEnded, currentStep, progress]
  );

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
            {exceptionMessage === null && currentStep > startingHeadlessStep ? (
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
  ["Validating Snapshot", t("Validating Snapshot")],
  ["Downloading Snapshot", t("Downloading Snapshot")],
  ["Downloading State Snapshot", t("Downloading State Snapshot")],
  ["Extracting Snapshot", t("Extracting Snapshot")],
  ["Starting Headless", t("Starting Headless")],
  ["Downloading Block Hashes", t("Downloading Block Hashes")],
  ["Downloading Blocks", t("Downloading Blocks")],
  ["Verifying Block Headers", t("Verifying Block Headers")],
  ["Downloading States", t("Downloading States")],
  ["Executing Actions", t("Executing Actions")],
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
