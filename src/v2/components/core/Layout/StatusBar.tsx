import React, { useEffect } from "react";
import { observer } from "mobx-react";
import ProgressBar from "./ProgressBar";
import { styled } from "src/v2/stitches.config";
import { useActor } from "@xstate/react";
import { preloadMachine, preloadService } from "src/v2/machines/preloadMachine";
import { t } from "@transifex/native";
import { StateFrom } from "xstate";
import { mergeMeta } from "../../../utils/mergeMeta";
import {
  usePreloadProgressSubscriptionSubscription,
  useNodeStatusSubscriptionSubscription,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";

const StatusBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: 500,
});

const StatusMessage = styled("span", {
  marginBottom: 8,
  fontWeight: "bold",
  textShadow: "$text",
});

const statusMessage = [
  t("Idling"),
  t("Validating Snapshot"),
  t("Downloading Snapshot"),
  t("Downloading State Snapshot"),
  t("Extracting Snapshot"),
  t("Starting Headless"),
  t("Downloading Block Hashes"),
  t("Downloading Blocks"),
  t("Verifying Block Headers"),
  t("Downloading States"),
  t("Executing Actions"),
  t("Done"),
] as string[];

type PreloadProgressSubscriptionSubscription = ReturnType<
  typeof usePreloadProgressSubscriptionSubscription
>["data"];

const getStatusMessage = (
  state: StateFrom<typeof preloadMachine>,
  data: PreloadProgressSubscriptionSubscription
) => {
  if (state.matches("idle")) {
    return statusMessage[0];
  } else if (state.matches("snapshot")) {
    return statusMessage[mergeMeta(state.meta).step];
  } else if (state.matches("headless")) {
    return statusMessage[5 + data?.preloadProgress?.currentPhase ?? 0];
  } else {
    return statusMessage[statusMessage.length - 1];
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

function StatusBar() {
  const [state, send] = useActor(preloadService);
  const standalone = useStore("standalone");

  const {
    data: preloadProgressSubscriptionResult,
    error,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;

    if (isEnded) {
      standalone.setReady(true);
      send("DONE");
      ipcRenderer.send("mixpanel-track-event", `Launcher/Preload Completed`);
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  useEffect(() => {
    if (error) console.error("fetch err", error);
  }, [error]);

  return (
    <StatusBarStyled>
      <StatusMessage>
        {getStatusMessage(state, preloadProgressSubscriptionResult)}
      </StatusMessage>
      {!!state.context.progress && (
        <ProgressBar percent={state.context.progress} />
      )}
      {!!preloadProgress?.extra.currentCount && (
        <ProgressBar
          percent={getProgress(
            preloadProgress?.extra.currentCount,
            preloadProgress?.extra.totalCount
          )}
        />
      )}
    </StatusBarStyled>
  );
}

export default observer(StatusBar);
