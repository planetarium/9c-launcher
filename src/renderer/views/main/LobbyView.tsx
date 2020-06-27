import * as React from "react";
import gql from "graphql-tag";
import { useState } from "react";
import { LinearProgress } from "@material-ui/core";
import { RPC_LOOPBACK_HOST, RPC_SERVER_PORT } from "../../../config";
import { IStoreContainer } from "../../../interfaces/store";
import { inject } from "mobx-react";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";

interface ILobbyProps {
  account: string;
  privateKey: string;
  isGameStarted: boolean;
  startGame(
    privateKey: string,
    rpcClient: boolean,
    rpcHost: string,
    rpcPort: number
  ): void;
}

const LobbyView = (props: ILobbyProps) => {
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();

  console.log(props.isGameStarted);

  return (
    <div>
      <label>You are using address: {props.account}</label>
      <br />
      {nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded ? (
        <button
          disabled={props.isGameStarted}
          onClick={(event: React.MouseEvent) => {
            props.startGame(
              props.privateKey,
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
      {props.isGameStarted ? <label>Now Running...</label> : null}
    </div>
  );
};

export default LobbyView;
