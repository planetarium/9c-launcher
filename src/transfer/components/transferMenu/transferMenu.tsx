import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import { StoreContext } from "src/transfer/hooks";
import { MenuItems } from "src/transfer/stores/views/menu";

const transifexTags = "Transfer/Menu";

const TransferMenu: React.FC = observer(() => {
  const { menuStore } = useContext(StoreContext);

  switch (menuStore.currentMenu) {
    case MenuItems.TRANSFER:
      return <T _str="Send other user" tag={transifexTags} onClick={menuStore.changeMenu(MenuItems.TRANSFER)}/>;
    case MenuItems.EXCHANGE:
      return <T _str="Exchange" tag={transifexTags} onClick={menuStore.changeMenu(MenuItems.EXCHANGE)}/>;
  }
});

export default TransferMenu;
