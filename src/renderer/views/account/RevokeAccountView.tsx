import * as React from "react";
import { observer } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container } from "@material-ui/core";
import AccountStore from "../../stores/account";
import { RouterStore } from "mobx-react-router";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }: IRevokeAccountProps) => {
    return (
      <Container>
        <p>do not implement yet</p>
      </Container>
    );
  }
);

export default RevokeAccountView;
