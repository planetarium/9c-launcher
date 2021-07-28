import { T } from "@transifex/react";
import React from "react"
import { MenuItems } from "src/transfer/stores/menu";
import useStores from "../../../transfer/hooks";

const transifexTags = "Transfer/Menu";

const TransferMenu: React.FC = () => {
  const { menuStore } = useStores();

  return (
    <></>
  );
}

export default TransferMenu;
