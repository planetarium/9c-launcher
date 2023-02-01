import { useMemo } from "react";
import {
  useGetNcgBalanceQuery,
  useBalanceByAgentSubscription,
} from "src/generated/graphql";
import { useLoginSession } from "./useLoginSession";

export function useBalance() {
  const { address } = useLoginSession();
  const { data: ncgBalanceQuery } = useGetNcgBalanceQuery({
    variables: {
      address,
    },
    skip: !address,
  });
  const { data: balance } = useBalanceByAgentSubscription({
    variables: {
      address,
    },
    skip: !address,
  });

  return useMemo(
    () => Number(balance?.balanceByAgent ?? ncgBalanceQuery?.goldBalance) ?? 0,
    [balance, ncgBalanceQuery]
  );
}
