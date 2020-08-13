import AccountStore from "../renderer/stores/account";
import { RouterStore } from "mobx-react-router";
import GameStore from "../renderer/stores/game";
// @ts-ignore
import DownloadStore from "../renderer/stores/download";
import StandaloneStore from "../renderer/stores/standalone";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
  gameStore: GameStore;
  standaloneStore: StandaloneStore;
}
