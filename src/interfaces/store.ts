import AccountStore from "../stores/account";
import { RouterStore } from "mobx-react-router";
import GameStore from "src/stores/game";
import StandaloneStore from "src/stores/standaloneStore";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
  gameStore: GameStore;
  standaloneStore: StandaloneStore;
}
