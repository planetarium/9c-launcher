import { Context, createContext, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import { IHeadlessStore } from "../stores/headless";
import MenuStore from "../stores/views/menu";
import TransferPageStore from "../stores/views/transfer";

export interface ITransferStoreContainer {
    headlessStore: IHeadlessStore
    menuStore: MenuStore
    transferPage: TransferPageStore
}

export const StoreContext = createContext<ITransferStoreContainer>({} as ITransferStoreContainer);

