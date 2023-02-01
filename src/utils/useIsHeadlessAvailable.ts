import { useNodeStatusQuery } from "src/generated/graphql";

export function useIsHeadlessAvailable() {
  const { data: nodeStatusQueryResult } = useNodeStatusQuery();

  return nodeStatusQueryResult?.nodeStatus?.preloadEnded;
}
