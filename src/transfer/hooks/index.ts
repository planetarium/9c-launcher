import { Context, createContext, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import TransferStore from "../stores/transfer";
import MenuStore from "../stores/menu";

export interface ITransferStoreContainer {
    transferStore: TransferStore
    menuStore: MenuStore
}

export const StoreContext = createContext<ITransferStoreContainer>({} as ITransferStoreContainer);

