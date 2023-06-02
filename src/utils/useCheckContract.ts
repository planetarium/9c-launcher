import { ApolloError } from "@apollo/client";
import { useCheckContractedQuery } from "src/generated/graphql";
import { useLoginSession } from "./useLoginSession";

interface ContractResult {
  loading: boolean;
  error?: ApolloError;
  contracted: boolean;
}

export function useCheckContract(usePolling: boolean = false): ContractResult {
  const address = useLoginSession()?.address;

  const { loading, data, error } = useCheckContractedQuery({
    variables: { agentAddress: address?.toHex() },
    pollInterval: usePolling ? 1000 : undefined,
    skip: !address,
  });

  return {
    loading,
    error,
    contracted: data?.stateQuery.contracted.contracted ?? false,
  };
}
