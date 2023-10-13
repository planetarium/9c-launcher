export type RpcEndpoints = {
  "dp.gql"?: string[];
  "9cscan.rest"?: string[];
  "headless.gql": string[];
  "headless.grpc": string[];
};

export type Planet = {
  id: string;
  name?: string;
  genesisHash?: string;
  genesisUri?: string;
  rpcEndpoints: RpcEndpoints;
};
