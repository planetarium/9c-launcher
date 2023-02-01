import { retry } from "@lifeomic/attempt";
import { SdkFunctionWrapper } from "src/generated/graphql-request";

const retryOptions = {
  delay: 100,
  maxAttempts: 5,
  factor: 1.5,
  timeout: 30000,
  jitter: true,
  minDelay: 100,
};

export const retryWrapper: SdkFunctionWrapper = <T>(action: () => Promise<T>) =>
  retry(action, retryOptions);
