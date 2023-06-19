export type ActivationStep =
  | "getGraphQLClient"
  | "preflightCheck"
  | "checkRequestPledge"
  | "createApprovePledgeTx"
  | "stageApprovePledgeTx"
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
