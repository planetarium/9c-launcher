import React from "react";

import { MobXProviderContext } from "mobx-react";
import { IStoreContainer } from "../interfaces/store";

// @ts-ignore
const storeContext: React.Context<IStoreContainer> = MobXProviderContext;

export default function useStores() {
  return React.useContext(storeContext);
}
