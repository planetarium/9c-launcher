import { useMemo } from "react";
import {
  useGetNcgBalanceQuery,
  useBalanceByAgentSubscription,
} from "src/generated/graphql";
import { useLoginSession } from "./useLoginSession";

export function useBalance() {
  const address = useLoginSession()?.address;
  const { data: ncgBalanceQuery } = useGetNcgBalanceQuery({
    variables: {
      address: address?.toString(),
    },
    skip: !address,
  });
  const { data: balance } = useBalanceByAgentSubscription({
    variables: {
      address: address?.toString(),
    },
    skip: !address,
  });

  return useMemo(
    () => Number(balance?.balanceByAgent ?? ncgBalanceQuery?.goldBalance) ?? 0,
    [balance, ncgBalanceQuery],
  );
}
