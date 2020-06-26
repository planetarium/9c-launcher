import * as React from "react";
import gql from "graphql-tag";
import { useState } from "react";
import { LinearProgress } from "@material-ui/core";
import { IpcRendererEvent, ipcRenderer } from "electron";
import { standaloneProperties, RPC_LOOPBACK_HOST } from "../config";
import { IStoreContainer } from "../interfaces/store";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../generated/graphql";

const LobbyView = ({ accountStore, routerStore }: IStoreContainer) => {
  const [isGameRunning, setGameRunningStatus] = useState(false);
  const executeGame = () => {
    setGameRunningStatus(true);
    ipcRenderer.send("launch game", {
      args: [
        `--private-key=${accountStore.privateKey}`,
        `--rpc-client=${true}`,
        `--rpc-server-host=${RPC_LOOPBACK_HOST}`,
        `--rpc-server-port=${standaloneProperties.RpcListenPort}`,
      ],
    });
  };

  ipcRenderer.on("game closed", (event: IpcRendererEvent) => {
    setGameRunningStatus(false);
  });

  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();

  return (
    <div>
      <label>You are using address: {accountStore.selectAddress}</label>
      <br />
      {nodeStatusSubscriptionResult?.nodeStatus.preloadEnded ? (
        <button
          disabled={isGameRunning}
          onClick={(event: React.MouseEvent) => {
            executeGame();
          }}
        >
          Start Game
        </button>
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
      {isGameRunning ? <label>Now Running...</label> : null}
    </div>
  );
};

export default LobbyView;
