import { useStore } from "./useStore";
import { ILoginSession } from "src/stores/account";

export function useLoginSession(): ILoginSession | null {
  const accountStore = useStore("account");

  return accountStore.loginSession;
}
