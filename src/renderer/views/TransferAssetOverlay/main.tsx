import {
  Button,
  Container,
  styled,
  Typography,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import montserrat from "src/renderer/styles/font";
import { T } from "@transifex/react";
import React, { useEffect } from "react";
import { useState, useMemo } from "react";
import { OverlayProps } from "src/utils/types";
import ExchangePage from "./swap";
import TransferPage from "./transfer";
import OverlayBase, {
  CloseButton,
} from "src/renderer/components/core/OverlayBase";
import { useStore } from "src/utils/useStore";
import { get } from "src/config";

const transifexTags = "Transfer/Main";

export enum MenuItems {
  TRANSFER,
  SWAP,
}

const MenuContainer = styled(Container)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  flex: "1",
  padding: "0",
});

const MenuButton = styled(Button)({
  color: "white",
  fontWeight: "bold",
  width: "241px",
  height: "61px",
  textAlign: "left",
  justifyContent: "flex-start",
  textTransform: "none",
  fontSize: "22px",
  padding: "15px",
});

const SelectedButton = styled(MenuButton)({
  backgroundColor: "#5f5f60",
});

const MainPageContainer = styled(OverlayBase)({
  "&&": {
    width: "970px",
    height: "650px",
    backgroundColor: "#1d1e1f",
    padding: "48px 52px",
    display: "flex",
    flexDirection: "column",
    color: "white",
  },
});

const TitleContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
});

const LayoutContainer = styled(Container)({
  display: "flex",
  flexDirection: "row",
  marginTop: "15px",
});

const TitleMessage = styled(Typography)({
  color: "#74f4bc",
  fontFamily: "Montserrat",
  fontSize: "40px",
  fontWeight: "bold",
});

const DescriptionTitleMessage = styled(Typography)({
  color: "white",
  fontSize: "18px",
});

function TransferAssetOverlay({ isOpen, onClose }: OverlayProps) {
  const isOdin = useStore("planetary").planet.id === "0x000000000000";
  const [menuItem, setMenuItem] = useState<MenuItems>(MenuItems.TRANSFER);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    fetch(
      get(
        "SwapAvailabilityCheckServiceUrl",
        "https://check.nine-chronicles.com/updates.json",
      ),
    )
      .then((res) => {
        if (res.status === 200) {
          setIsAvailable(false);
        }
      })
      .catch(() => {
        console.error("Failed to fetch Availablity");
        setIsAvailable(true);
      });
  }, []);

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: "dark",
        },
        typography: {
          fontFamily: "Montserrat",
        },
        overrides: {
          MuiCssBaseline: {
            "@global": {
              "@font-face": [montserrat],
            },
          },
        },
      }),
    [],
  );

  const getMenuItem = (menuItem: MenuItems) => {
    switch (menuItem) {
      case MenuItems.TRANSFER:
        return <T _str="Send other user" tag={transifexTags} />;
      case MenuItems.SWAP:
        return <T _str="Swap to WNCG" tag={transifexTags} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <MainPageContainer isOpen={isOpen} onDismiss={onClose}>
        <CloseButton onClick={() => onClose()} />
        <TitleContainer>
          <TitleMessage>
            <T _str="Send NCG" _tags={transifexTags} />
          </TitleMessage>
          <DescriptionTitleMessage>
            <T
              _str="You can transfer NCG to other user or ETH account."
              _tags={transifexTags}
            />
          </DescriptionTitleMessage>
        </TitleContainer>
        <LayoutContainer>
          <MenuContainer>
            {Object.keys(MenuItems).map((key) => {
              const menu = MenuItems[key as keyof typeof MenuItems];
              if (menu === MenuItems.SWAP && (!isOdin || !isAvailable)) return;
              if (!isNaN(Number(menu))) {
                if (menu === menuItem) {
                  return (
                    <SelectedButton key={key} onClick={() => setMenuItem(menu)}>
                      {getMenuItem(menu)}
                    </SelectedButton>
                  );
                } else {
                  return (
                    <MenuButton key={key} onClick={() => setMenuItem(menu)}>
                      {getMenuItem(menu)}
                    </MenuButton>
                  );
                }
              }
            })}
          </MenuContainer>
          {menuItem === MenuItems.TRANSFER ? (
            <TransferPage />
          ) : (
            <ExchangePage />
          )}
        </LayoutContainer>
      </MainPageContainer>
    </ThemeProvider>
  );
}

export default TransferAssetOverlay;
