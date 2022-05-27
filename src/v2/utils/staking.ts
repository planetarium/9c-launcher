import {
  useCurrentStakingQuery,
  useTipSubscription,
} from "../generated/graphql";
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
  const { data: tip } = useTipSubscription();

  return {
    ...current?.stateQuery.stakeState,
    tip: tip?.tipChanged?.index ?? 0,
    canClaim:
      !!tip?.tipChanged &&
      !!current?.stateQuery.stakeState?.claimableBlockIndex &&
      current.stateQuery.stakeState.claimableBlockIndex >= tip.tipChanged.index,
    refetch,
  };
}
