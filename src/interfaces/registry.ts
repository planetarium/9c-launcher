export type RpcEndpoints = {
  "dp.gql"?: string[];
  "9cscan.rest"?: string[];
  "headless.gql": string[];
  "headless.grpc": string[];
  "market.rest"?: string[];
  "world-boss.rest"?: string[];
  "patrol-reward.gql"?: string[];
};

export type Planet = {
  id: string;
  name?: string;
  genesisHash?: string;
  genesisUri?: string;
  rpcEndpoints: RpcEndpoints;
};
