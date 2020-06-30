import * as React from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { observer, inject } from "mobx-react";
import { Button } from "@material-ui/core";
import { standaloneProperties, LOCAL_SERVER_URL } from "../../../config";

const MiningView = observer((props: IStoreContainer) => {
  const { accountStore, routerStore, gameStore } = props;

  const runStandalone = (isMining: boolean) => {
    routerStore.push("/lobby");
    const properties = {
      ...standaloneProperties,
      // Standalone에서는 마이닝을 안 할 거면 true를 주는 걸로 되어 있어서
      // 인터페이스로 한 겹 감쌉니다.
      NoMiner: !isMining,
      PrivateKeyString: accountStore.privateKey,
    };

    fetch(`http://${LOCAL_SERVER_URL}/initialize-standalone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(properties),
    })
      .then((response) => response.text())
      .then((body) => console.log(body))
      .then((_) =>
        fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
          method: "POST",
        })
      )
      .then((response) => response.text())
      .then((body) => console.log(body))
      .catch((error) => console.log(error));
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
});

export default inject("accountStore", "routerStore", "gameStore")(MiningView);
