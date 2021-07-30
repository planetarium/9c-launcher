import { Context, createContext, useContext } from "react";

import { MobXProviderContext } from "mobx-react";
import HeadlessStore from "../stores/headless";
import MenuStore from "../stores/views/menu";

export interface ITransferStoreContainer {
    headlessStore: HeadlessStore
    menuStore: MenuStore
}

export const StoreContext = createContext<ITransferStoreContainer>({} as ITransferStoreContainer);

