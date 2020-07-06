import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { LinearProgress } from "@material-ui/core";
import { LinearProgressWithLabel } from "../../components/LinerProgressWithLabel";
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

  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    if (isEnded) {
      routerStore.push("/lobby");
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  React.useEffect(() => {
    const prog = getProgress(
      preloadProgressSubscriptionResult?.preloadProgress?.extra.currentCount,
      preloadProgressSubscriptionResult?.preloadProgress?.extra.totalCount
    );
    setProgress(prog);
  }, [preloadProgressSubscriptionResult?.preloadProgress?.extra]);

  return (
    <div>
      <LinearProgressWithLabel value={progress} />
      <p>Preload Status</p>
      <p>
        {preloadProgressSubscriptionResult?.preloadProgress?.currentPhase} by{" "}
        {preloadProgressSubscriptionResult?.preloadProgress?.totalPhase}
      </p>
      <p>{preloadProgressSubscriptionResult?.preloadProgress?.extra.type} </p>
    </div>
  );
});

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default inject("routerStore")(PreloadView);
