import * as React from "react";
import gql from "graphql-tag";
import { useState } from "react";
import { LinearProgress } from "@material-ui/core";
import { RPC_LOOPBACK_HOST, RPC_SERVER_PORT } from "../../config";
import { IStoreContainer } from "../../interfaces/store";
import { inject } from "mobx-react";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../generated/graphql";

const LobbyView = ({ accountStore, gameStore }: IStoreContainer) => {
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
      {nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded ? (
        <button
          disabled={gameStore.isGameStarted}
          onClick={(event: React.MouseEvent) => {
            gameStore.startGame(
              accountStore.privateKey,
              true,
              RPC_LOOPBACK_HOST,
              RPC_SERVER_PORT
            );
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
      {gameStore.isGameStarted ? <label>Now Running...</label> : null}
    </div>
  );
};

export default LobbyView;
