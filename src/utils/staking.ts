import { useCurrentStakingQuery } from "src/generated/graphql";
import { useTip } from "./useTip";
import { useLoginSession } from "./useLoginSession";
import { Address } from "@planetarium/account";

export function useStaking() {
  const address: Address | undefined = useLoginSession()?.address;
  const commonQuery = {
    variables: {
      address: address?.toString(),
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
