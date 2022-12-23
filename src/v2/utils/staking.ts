import { useCurrentStakingQuery } from "../generated/graphql";
import { useStore } from "./useStore";
import { useTip } from "./useTip";

export function useStaking() {
  const account = useStore("account");
  const commonQuery = {
    variables: {
      address: account.address,
    },
    skip: !account.isLogin,
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
