import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { LinearProgress } from "@material-ui/core";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";

const PreloadView = observer((props: IStoreContainer) => {
  const { routerStore } = props;

  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();

  React.useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    if (isEnded) {
      routerStore.push("/lobby");
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  return (
    <div>
      <LinearProgress
        variant="determinate"
        value={getProgress(
          preloadProgressSubscriptionResult?.preloadProgress?.extra
            .currentCount,
          preloadProgressSubscriptionResult?.preloadProgress?.extra.totalCount
        )}
      />
      <p>Preload Status</p>
      <p>{preloadProgressSubscriptionResult?.preloadProgress?.extra.type} </p>
    </div>
  );
});

const getProgress = (current: number, total: number) => {
  return total === 0 ? 0 : (current / total) * 100;
};

export default inject("routerStore")(PreloadView);
