import { useStore } from "./useStore";

export function useLoginSession() {
  const accountStore = useStore("account");

  return {
    address: accountStore.loginSession?.address,
    account: accountStore.loginSession?.account,
    publicKey: accountStore.loginSession?.publicKey,
  };
}
