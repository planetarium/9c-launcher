export type ActivationStep =
  | "preflightCheck"
  | "getGraphQLClient"
  | "checkPledgeRequestTx"
  | "createApprovePledgeTx"
  | "stageTx"
  | "exceptionError";

export type ActivationSuccessResult = {
  result: true;
  txId?: string;
};

export type ActivationFailResult = {
  result: false;
  error: {
    error: Error;
    step: ActivationStep;
  };
};

export type ActivationResult = ActivationSuccessResult | ActivationFailResult;

export type ActivationFunction = (txId: string) => Promise<ActivationResult>;
