import { Context, createContext, useContext } from "react";

import { IHeadlessStore } from "../stores/headless";
import MenuStore from "../stores/views/menu";
import TransferPageStore from "../stores/views/transfer";
import SwapPageStore from "../stores/views/swap";

export interface ITransferStoreContainer {
  headlessStore: IHeadlessStore;
  menuStore: MenuStore;
  transferPage: TransferPageStore;
  swapPage: SwapPageStore;
}

export const StoreContext = createContext<ITransferStoreContainer>(
  {} as ITransferStoreContainer
);
