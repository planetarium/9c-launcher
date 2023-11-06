import { makeAutoObservable } from "mobx";
import React, { createContext, useContext } from "react";
import AccountStore from "src/stores/account";
import GameStore from "src/stores/game";
import PlanetaryStore from "src/stores/planetary";
import TransferStore from "src/stores/transfer";

export class RootStore {
  account: AccountStore;
  game: GameStore;
  transfer: TransferStore;
  planetary: PlanetaryStore;

  constructor() {
    makeAutoObservable(this);
    this.account = new AccountStore(this);
    this.game = new GameStore(this);
    this.transfer = new TransferStore(this);
    this.planetary = new PlanetaryStore(this);
  }
}

const store: RootStore = new RootStore();

export const StoreContext = createContext<RootStore>(store);

export function StoreProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

/**
 * Returns the store for the given store name.
 * If the store name is not provided, returns the store object containing all stores.
 *
 * @param {string=} [store] - The name of the store to return. Optional.
 * @returns {object} The store specified by the store name.
 */
export function useStore<T extends keyof typeof store>(store: T): RootStore[T];
/**
 * @returns {object} The store object containing all stores.
 */
export function useStore(): RootStore;
export function useStore(store?: keyof RootStore) {
  const context = useContext(StoreContext);
  return store ? context[store] : context;
}
