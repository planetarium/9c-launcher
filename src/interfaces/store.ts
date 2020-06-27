import AccountStore from "../renderer/stores/account";
import { RouterStore } from "mobx-react-router";
import GameStore from "../renderer/stores/game";
import DownloadStore from "../renderer/stores/download";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
  gameStore: GameStore;
}
