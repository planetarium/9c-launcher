import { useCurrentStakingQuery } from "src/generated/graphql";
import { useStore } from "./useStore";
import { useTip } from "./useTip";
import { useLoginSession } from "./useLoginSession";

export function useStaking() {
  const { address } = useLoginSession();
  const commonQuery = {
    variables: {
      address,
    },
    skip: !address,
  };

  const { data: current, refetch } = useCurrentStakingQuery(commonQuery);
  const tip = useTip();

  return {
    ...current?.stateQuery.stakeState,
    tip,
    canClaim:
      !!current?.stateQuery.stakeState?.claimableBlockIndex &&
      current.stateQuery.stakeState.claimableBlockIndex <= tip,
    refetch,
  };
}
