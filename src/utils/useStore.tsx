import React, { createContext, useContext } from "react";
import AccountStore from "src/stores/account";
import GameStore from "src/stores/game";
import TransferStore from "src/stores/transfer";

const stores = {
  account: new AccountStore(),
  game: new GameStore(),
  transfer: new TransferStore(),
} as const;

export const StoreContext = createContext<typeof stores>(stores);

export function StoreProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );
}

/**
 * Returns the store for the given store name.
 * If the store name is not provided, returns the store object containing all stores.
 *
 * @param {string=} [store] - The name of the store to return. Optional.
 * @returns {object} The store specified by the store name.
 */
export function useStore<T extends keyof typeof stores>(
  store: T
): typeof stores[T];
/**
 * @returns {object} The store object containing all stores.
 */
export function useStore(): typeof stores;
export function useStore(store?: keyof typeof stores) {
  const context = useContext(StoreContext);
  return store ? context[store] : context;
}
