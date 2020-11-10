import AccountStore from "../renderer/stores/account";
import { RouterStore } from "mobx-react-router";
import GameStore from "../renderer/stores/game";
import StandaloneStore from "../renderer/stores/standaloneStore";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
  gameStore: GameStore;
  standaloneStore: StandaloneStore;
}
