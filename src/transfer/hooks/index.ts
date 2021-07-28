import { Context, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import TransferStore from "../stores/transfer";
import MenuStore from "../stores/menu";

interface IStoreContainer {
    transferStore: TransferStore
    menuStore: MenuStore
}

// @ts-ignore
const storeContext: Context<IStoreContainer> = MobXProviderContext;

export default function useStores() {
  return useContext(storeContext);
}
