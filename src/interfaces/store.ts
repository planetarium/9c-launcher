import AccountStore from "../stores/account";
import { RouterStore } from "mobx-react-router";
import GameStore from "src/stores/game";
import RpcStore from "src/stores/rpc";
import TransferStore from "src/stores/transfer";

export interface IStoreContainer {
  accountStore: AccountStore;
  routerStore: RouterStore;
  gameStore: GameStore;
  transferStore: TransferStore;
  rpcStore: RpcStore;
}
