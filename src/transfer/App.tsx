import { useEventCallback } from "@material-ui/core";
import { GraphQLClient } from "graphql-request";
import React from "react";
import { useEffect } from "react";
import { getSdk } from "src/generated/graphql-request";
import { IStoreContainer } from "src/interfaces/store";
import { ITransferStoreContainer, StoreContext } from "./hooks";
import MainPage from "./pages/main/main";
import MenuStore from "./stores/views/menu";
import HeadlessStore from "./stores/headless";
import TransferPageStore from "./stores/views/transfer";

const client = new GraphQLClient(`http://localhost:23061/graphql`);
const headlessGraphQLSDK = getSdk(client);

const storeContainer: ITransferStoreContainer = {
  headlessStore: new HeadlessStore(headlessGraphQLSDK),
  menuStore: new MenuStore(),
  transferPage: new TransferPageStore()
}

const handleDetailView = (tx: string) => {
  if (process.versions['electron']) {
    import('electron')
      .then(({ shell }) => {
        shell.openExternal(
          `https://explorer.libplanet.io/9c-main/transaction/?${tx}`);
      });
  }
}

const App: React.FC = () => {
  useEffect(() => {
    async function main() {
      await storeContainer.headlessStore.trySetAgentAddress();
      await storeContainer.headlessStore.updateBalance();
    }
    main();
  }, []);
  return (
    <StoreContext.Provider value={storeContainer}>
      <MainPage onDetailedView={handleDetailView} />
    </StoreContext.Provider>
  )
};

export default App;
