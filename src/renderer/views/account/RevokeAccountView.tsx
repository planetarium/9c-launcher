import * as React from "react";
import { observer } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container } from "@material-ui/core";

const RevokeAccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }: IStoreContainer) => {
    return (
      <Container>
        <p>do not implement yet</p>
      </Container>
    );
  }
);

export default RevokeAccountView;
