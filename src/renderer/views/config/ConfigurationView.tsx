import * as React from "react";
import { useState } from "react";
import { LinearProgress, Button } from "@material-ui/core";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import ClearCacheButton from "../../components/ClearCacheButton";

const ConfigurationView = observer(
  ({ accountStore, routerStore }: IStoreContainer) => {
    return (
      <div>
        <Button
          onClick={() => routerStore.push("/")}
          variant="contained"
          color="primary"
        >
          Back to Home
        </Button>
        <br />
        <br />
      </div>
    );
  }
);

export default inject("accountStore", "routerStore")(ConfigurationView);
