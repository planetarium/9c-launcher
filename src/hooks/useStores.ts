import { Context, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";

// @ts-ignore
const storeContext: Context<IStoreContainer> = MobXProviderContext;

export default function useStores() {
  return useContext(storeContext);
}
