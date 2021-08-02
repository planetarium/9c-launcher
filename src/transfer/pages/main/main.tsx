import { Container, styled, Typography } from "@material-ui/core";
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

const MainPageContainer = styled(Container)({
  backgroundColor: "#1d1e1f",
  padding: '48px 52px',
  display: "flex",
  flexDirection: "column",
  color: 'white'
});

const TitleContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
});

const LayoutContainer = styled(Container)({
  display: "flex",
  flexDirection: "row",
  marginTop: "25px",
});

const TitleMessage = styled(Typography)({
  color: '#74f4bc',
  fontFamily: "Montserrat",
  fontSize: "40px",
  fontWeight: "bold"
});

const DescriptionTitleMessage = styled(Typography)({
  color: 'white',
  fontSize: '18px',
});

const MainPage: React.FC<Props> = observer((props: Props) => {
  const { onDetailedView } = props;
  const { menuStore } = useContext(StoreContext);

  return (
    <MainPageContainer>
      <TitleContainer>
        <TitleMessage>
          <T _str="Send NCG" _tags={transifexTags} />
        </TitleMessage>
        <DescriptionTitleMessage>
          <T _str="You can transfer NCG to other user or ETH account." _tags={transifexTags} />
        </DescriptionTitleMessage>
      </TitleContainer>
      <LayoutContainer>
          <TransferMenu />
          {menuStore.currentMenu === MenuItems.TRANSFER ? <TransferPage onDetailedView={onDetailedView} /> : <ExchangePage />}
      </LayoutContainer>
    </MainPageContainer>
  );
});

export default MainPage;
