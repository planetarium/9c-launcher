import React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Container, InputLabel } from "@material-ui/core";
import CreateAccountView from "./CreateAccountView";
import RevokeAccountView from "./RevokeAccountView";

import { T } from "@transifex/react";

const transifexTags = "account";

const AccountView: React.FC<IStoreContainer> = observer(
  ({ accountStore, routerStore }) => {
    return (
      <div>
        <button
          onClick={() => {
            routerStore.push("/account/create");
          }}
        >
          <T _str="create key" _tags={transifexTags} />
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/revoke");
          }}
        >
          <T _str="revoke key" _tags={transifexTags} />
        </button>
        <button
          onClick={() => {
            routerStore.push("/account/reset/review-private-key");
          }}
        >
          <T _str="reset key" _tags={transifexTags} />
        </button>
        <button
          onClick={() => {
            routerStore.push("/");
          }}
        >
          <T _str="back to the home" _tags={transifexTags} />
        </button>
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(AccountView);
