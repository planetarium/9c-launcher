import AccountStore from "../renderer/stores/account";
import { RouterStore } from "mobx-react-router";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
}
