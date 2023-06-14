export type ActivationStep =
  | "getGraphQLClient"
  | "preflightCheck"
  | "checkPledgeRequestTx"
  | "createApprovePledgeTx"
  | "stageTx"
  | "exceptionError";

export type ActivationSuccessResult = {
  result: true;
};

export type ActivationFailResult = {
  result: false;
  error: {
    error: Error;
    step: ActivationStep;
  };
};

export type ActivationResult = ActivationSuccessResult | ActivationFailResult;

export type ActivationFunction = () => Promise<ActivationResult>;
