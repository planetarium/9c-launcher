import { useCurrentStakingQuery, useGetTipQuery } from "../generated/graphql";
import { useStore } from "./useStore";

export function useStaking() {
  const account = useStore("account");
  const commonQuery = {
    variables: {
      address: account.selectedAddress,
    },
    skip: !account.isLogin,
  };

  const { data: current, refetch } = useCurrentStakingQuery(commonQuery);
  const { data: tip } = useGetTipQuery({
    pollInterval: 1000,
  });

  return {
    ...current?.stateQuery.stakeState,
    tip: tip?.nodeStatus.tip.index ?? 0,
    canClaim:
      !!tip &&
      !!current?.stateQuery.stakeState?.claimableBlockIndex &&
      current.stateQuery.stakeState.claimableBlockIndex <=
        tip.nodeStatus.tip.index,
    refetch,
  };
}
