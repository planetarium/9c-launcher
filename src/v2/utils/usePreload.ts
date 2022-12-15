import { preloadMachine, preloadService } from "src/v2/machines/preloadMachine";
import { t } from "@transifex/native";
import { StateFrom } from "xstate";
import { mergeMeta } from "./mergeMeta";
import { useActor } from "@xstate/react";
import {
  usePreloadProgressSubscriptionSubscription,
  useNodeStatusSubscriptionSubscription,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { ipcRenderer } from "electron";
import { useEffect, useMemo } from "react";
import { trackEvent } from "./mixpanel";

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
    return statusMessage[5 + (data?.preloadProgress?.currentPhase ?? 0)];
  } else if (state.matches("error")) {
    return state.context.error;
  } else {
    return statusMessage[statusMessage.length - 1];
  }
};

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return undefined;
  if (total === undefined) return undefined;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export function usePreload() {
  const [state, send] = useActor(preloadService);

  const { data: preloadProgressSubscriptionResult } =
    usePreloadProgressSubscriptionSubscription();
  const { data: nodeStatusSubscriptionResult } =
    useNodeStatusSubscriptionSubscription();

  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;

    if (isEnded) {
      send("DONE");
      trackEvent(`Launcher/Preload Completed`);
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  const progress = useMemo(
    () =>
      state.matches("snapshot")
        ? state.context.progress
        : getProgress(
            preloadProgress?.extra.currentCount,
            preloadProgress?.extra.totalCount
          ),
    [
      state,
      preloadProgress?.extra.currentCount,
      preloadProgress?.extra.totalCount,
    ]
  );

  return {
    message: getStatusMessage(state, preloadProgressSubscriptionResult),
    isDone: standalone.Ready,
    progress,
    blockCount: useMemo(
      () =>
        state.matches("headless")
          ? preloadProgress?.extra.totalCount
          : undefined,
      [state, preloadProgress?.extra.totalCount]
    ),
    error: state.matches("error") ? state.context.error : null,
  };
}

export function useIsPreloadDone() {
  const [state] = useActor(preloadService);
  return state.matches("done");
}
