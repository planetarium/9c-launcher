import { T } from "@transifex/react";
import React from "react"
import TransferMenu from "../../components/transferMenu/transferMenu";
import { MenuItems } from "../../stores/menu";
import useStores from "../../../transfer/hooks";
import ExchangePage from "../exchange/exchange";
import TransferPage from "../transfer/transfer";

const transifexTags = "Transfer/Main";

const MainPage: React.FC = () => {
  const { menuStore } = useStores();

  return (
    <div>
      <h1>
        <T _str="Send NCG" _tags={transifexTags} />
      </h1>
      <p>
        <T _str="You can transfer NCG to other user or ETH account." _tags={transifexTags} />
      </p>
      <div>
        <TransferMenu />
      </div>
      <div>
        {menuStore.currentMenu === MenuItems.TRANSFER ? <TransferPage /> : <ExchangePage />}
      </div>
    </div>
  );
}

export default MainPage;
