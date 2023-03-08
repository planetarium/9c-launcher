export type ActivationStep =
  | "getActivationInfo"
  | "getGraphQLClient"
  | "getActivationAddress"
  | "createActivateAccountTx"
  | "stageTx";

export type ActivationSuccessResult = {
  result: true;
  txId: string;
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
