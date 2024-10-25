import {z} from 'zod';

export type Bridge = {
  agent: string;
  avatar: string;
};
export type RpcEndpoints = {
  'dp.gql'?: string[];
  '9cscan.rest'?: string[];
  'headless.gql': string[];
  'headless.grpc': string[];
  'market.rest'?: string[];
  'world-boss.rest'?: string[];
  'patrol-reward.gql'?: string[];
  'guild.rest'?: string[];
};

export type Planet = {
  id: string;
  name?: string;
  genesisHash?: string;
  genesisUri?: string;
  rpcEndpoints: RpcEndpoints;
  bridges?: {[key: string]: Bridge};
  guildIconBucket?: string;
};

// Zod schema for Bridge
export const BridgeSchema = z.object({
  agent: z.string(),
  avatar: z.string(),
});

// Zod schema for RpcEndpoints
export const RpcEndpointsSchema = z.object({
  'dp.gql': z.string().array().optional(),
  '9cscan.rest': z.string().array().optional(),
  'headless.gql': z.string().array(),
  'headless.grpc': z.string().array(),
  'market.rest': z.string().array().optional(),
  'world-boss.rest': z.string().array().optional(),
  'patrol-reward.gql': z.string().array().optional(),
  'guild.rest': z.string().array().optional(),
});

// Zod schema for Planet
export const PlanetSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  genesisHash: z.string().optional(),
  genesisUri: z.string().optional(),
  rpcEndpoints: RpcEndpointsSchema,
  bridges: z.record(BridgeSchema).optional(),
  guildIconBucket: z.string().optional(),
});

export const PlanetArraySchema = z.array(PlanetSchema);
