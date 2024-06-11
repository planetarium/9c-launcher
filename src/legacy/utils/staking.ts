import { useUserStakingQuery } from "src/generated/graphql";
import { useTip } from "./useTip";
import { useLoginSession } from "./useLoginSession";
import { Address } from "@planetarium/account";

export function useUserStaking() {
  const address: Address | undefined = useLoginSession()?.address;
  const commonQuery = {
    variables: {
      address: address?.toString(),
    },
    skip: !address,
  };

  const { data: userStake, refetch } = useUserStakingQuery(commonQuery);
  const tip = useTip();

  return {
    ...userStake?.stateQuery.stakeState,
    tip,
    canClaim:
      !!userStake?.stateQuery.stakeState?.claimableBlockIndex &&
      userStake.stateQuery.stakeState.claimableBlockIndex <= tip,
    refetch,
  };
}
