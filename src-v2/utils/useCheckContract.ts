import { ApolloError } from "@apollo/client";
import { useCheckContractedQuery } from "src/generated/graphql";
import { useLoginSession } from "./useLoginSession";

interface ContractResult {
  loading: boolean;
  error?: ApolloError;
  approved: boolean;
  requested: boolean;
  stopPolling: () => void;
}

export function useCheckContract(usePolling: boolean = false): ContractResult {
  const address = useLoginSession()?.address;

  const { loading, data, error, stopPolling } = useCheckContractedQuery({
    variables: { agentAddress: address?.toHex() },
    pollInterval: usePolling ? 1000 : undefined,
    fetchPolicy: "no-cache",
    skip: !address,
  });

  return {
    loading,
    error,
    approved: data?.stateQuery.pledge.approved ?? false,
    requested: data?.stateQuery.pledge.patronAddress !== (undefined || null),
    stopPolling,
  };
}
