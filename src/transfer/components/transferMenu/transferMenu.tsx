import { Button, Container, styled } from "@material-ui/core";
import { T } from "@transifex/react";
import { observer } from "mobx-react";
import React, { useContext } from "react"
import { StoreContext } from "src/transfer/hooks";
import { MenuItems } from "src/transfer/stores/views/menu";

const transifexTags = "Transfer/Menu";


const MenuContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flex: '1',
  padding: '0'
});


const MenuButton = styled(Button)({
  color: 'white',
  fontWeight: 'bold',
  width: '241px',
  height: '61px',
  textAlign: 'left',
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontSize: '22px',
  padding: '15px'
});

const SelectedButton = styled(MenuButton)({
  backgroundColor: '#5f5f60',
});

const TransferMenu: React.FC = observer(() => {
  const { menuStore } = useContext(StoreContext);
  const getMenuItem = (menuItem: MenuItems) => {
    switch (menuItem) {
      case MenuItems.TRANSFER:
        return <T _str="Send other user" tag={transifexTags} onClick={() => menuStore.changeMenu(MenuItems.TRANSFER)} />;
      case MenuItems.EXCHANGE:
        return <T _str="Exchange" tag={transifexTags} onClick={() => menuStore.changeMenu(MenuItems.EXCHANGE)} />;
    }
  }

  return <MenuContainer>
    {
      Object.keys(MenuItems).map(key => {
        const menu = MenuItems[key as keyof typeof MenuItems];
        if(!isNaN(Number(menu))) {
          if (menu === menuStore.currentMenu) {
            return <SelectedButton key={key}>{getMenuItem(menu)}</SelectedButton>
          } else {
            return <MenuButton key={key}>{getMenuItem(menu)}</MenuButton>
          }
        }
      })
    }
  </MenuContainer>

});

export default TransferMenu;
