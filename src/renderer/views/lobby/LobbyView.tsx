import * as React from "react";
import { LinearProgress } from "@material-ui/core";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";

const LobbyView = observer((props: IStoreContainer) => {
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const { accountStore, gameStore } = props;

  return (
    <div>
      <label>
        {gameStore.isGameStarted ? "Now Running..." : "Running the game"}
      </label>
      <br />
      <br />
      {nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded ? (
        <button
          disabled={gameStore.isGameStarted}
          onClick={(event: React.MouseEvent) => {
            gameStore.startGame(accountStore.privateKey);
          }}
        >
          Start Game
        </button>
      ) : (
        <>
          <LinearProgress
            variant="determinate"
            value={getProgress(
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .currentCount,
              preloadProgressSubscriptionResult?.preloadProgress?.extra
                .totalCount
            )}
          />
          <p>Preload Status</p>
          <p>
            {preloadProgressSubscriptionResult?.preloadProgress?.extra.type}{" "}
          </p>
        </>
      )}
    </div>
  );
});

const getProgress = (current: number, total: number) => {
  return total === 0 ? 0 : (current / total) * 100;
};

export default inject("accountStore", "gameStore")(LobbyView);
