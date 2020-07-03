import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button } from "@material-ui/core";

const MiningView = observer(
  ({ accountStore, standaloneStore, routerStore }: IStoreContainer) => {
    const runStandalone = (isMining: boolean) => {
      standaloneStore.setMiner(!isMining);
      routerStore.push("/lobby/preload");
      standaloneStore.initStandalone(accountStore.privateKey).catch((error) => {
        console.log(error);
        routerStore.push("/error");
      });
    };

    return (
      <div>
        <label>Please turn on the mining option.</label>
        <br />
        <Button
          variant="contained"
          onClick={() => {
            runStandalone(false);
          }}
        >
          Not now
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            runStandalone(true);
          }}
        >
          Got it!
        </Button>
      </div>
    );
  }
);

export default inject(
  "accountStore",
  "routerStore",
  "standaloneStore"
)(MiningView);
