import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React from "react"
import { useContext } from "react";
import { StoreContext } from "src/transfer/hooks";
import TransferMenu from "../../components/TransferMenu/TransferMenu";
import { MenuItems } from "../../stores/views/menu";
import ExchangePage from "../exchange/exchange";
import TransferPage from "../transfer/transfer";

const transifexTags = "Transfer/Main";
export type Props = {
  onDetailedView: (tx: string) => void;
};

const MainPage: React.FC<Props> = observer((props: Props) => {
  const { onDetailedView } = props;
  const { menuStore } = useContext(StoreContext);

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
        {menuStore.currentMenu === MenuItems.TRANSFER ? <TransferPage onDetailedView={onDetailedView} /> : <ExchangePage />}
      </div>
    </div>
  );
});

export default MainPage;
