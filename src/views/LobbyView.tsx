import * as React from "react";
import gql from "graphql-tag";
import { useState } from "react";
import { LinearProgress } from "@material-ui/core";
import { IpcRendererEvent, ipcRenderer } from "electron";
import { standaloneProperties, RPC_LOOPBACK_HOST } from "../config";
import { IStoreContainer } from "../interfaces/store";
import {
  withNodeStatus,
  useNodeStatusQuery,
  usePreloadProgressSubscriptionSubscription
} from "../generated/graphql";

const LobbyView = ({ accountStore, routerStore }: IStoreContainer) => {
  const executeGame = () => {
    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${accountStore.privateKey}`,
        `--rpc-client=${true}`,
        `--rpc-server-host=${RPC_LOOPBACK_HOST}`,
        `--rpc-server-port=${standaloneProperties.RpcListenPort}`
      ]
    });
  };

  const {
    data: preloadProgressSubscriptionResult,
    loading: preloadProgressLoading
  } = usePreloadProgressSubscriptionSubscription();
  const { data: nodeStatusQueryResult } = useNodeStatusQuery();

  // preload가 끝나고 바로 nodeStatus가 갱신되는 것이 아니라서 추측을 통해 nodeStatus 값을 갱신해줍니다.
  // FIXME: 주기적으로 검사하는 코드로 고치는 것이 좋을 것 같습니다. (setInterval)
  if (
    undefined !== nodeStatusQueryResult &&
    undefined !== nodeStatusQueryResult.nodeStatus &&
    nodeStatusQueryResult?.nodeStatus !== null
  ) {
    const { nodeStatus } = nodeStatusQueryResult;
    nodeStatus.bootstrapEnded =
      undefined !== preloadProgressSubscriptionResult?.preloadProgress;
    if (undefined !== preloadProgressSubscriptionResult?.preloadProgress) {
      nodeStatus.preloadEnded =
        preloadProgressSubscriptionResult.preloadProgress?.currentPhase >= 4 &&
        preloadProgressSubscriptionResult.preloadProgress?.extra.totalCount ===
          preloadProgressSubscriptionResult?.preloadProgress?.extra
            .currentCount;
    }
  }

  return (
    <div>
      <label>You are using address: {accountStore.selectAddress}</label>
      <br />
      <button
        onClick={(event: React.MouseEvent) => {
          executeGame();
        }}
      >
        Start Game
      </button>
      <br />
      <br />
      {preloadProgressLoading ||
      nodeStatusQueryResult?.nodeStatus?.preloadEnded ? (
        <></>
      ) : (
        <>
          <LinearProgress />
          <p>Preload Status</p>
          <p>
            {preloadProgressSubscriptionResult?.preloadProgress?.extra.type}{" "}
            {
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .currentCount
            }{" "}
            /{" "}
            {
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .totalCount
            }
          </p>
        </>
      )}
    </div>
  );
};

export default LobbyView;
