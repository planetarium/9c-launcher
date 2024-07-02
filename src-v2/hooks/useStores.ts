import { Context, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";

const storeContext: Context<IStoreContainer> = MobXProviderContext as any;

export default function useStores() {
  return useContext(storeContext);
}
