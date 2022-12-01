import {
  Button as ButtonOrigin,
  ButtonProps,
  CircularProgress,
  Container,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import { inject, observer } from "mobx-react";
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useActivationAddressLazyQuery,
  useActivationKeyNonceQuery,
  useGetNextTxNonceQuery,
  useStageTxMutation,
} from "../../../generated/graphql";
import { IStoreContainer } from "../../../interfaces/store";
import { sleep } from "../../../utils";
import { ipcRenderer } from "electron";

import { T } from "@transifex/react";

import lobbyViewStyle from "./LobbyView.style";
import { tmpName } from "tmp-promise";
import { get } from "../../../config";

interface ILobbyViewProps extends IStoreContainer {
  onLaunch: () => void;
}

const Button = (
  props: Omit<ButtonProps, "fullWidth" | "variant" | "color">
) => <ButtonOrigin fullWidth variant="contained" color="primary" {...props} />;

const transifexTags = "lobby";

const LobbyView = observer((props: ILobbyViewProps) => {
  const classes = lobbyViewStyle();
  const { accountStore, standaloneStore } = props;
  const [activation, { loading, data: status, refetch: activationRefetch }] =
    useActivationAddressLazyQuery({
      variables: {
        address: accountStore.selectedAddress,
      },
    });
  const [activationKey, setActivationKey] = useState(
    accountStore.activationKey
  );
  const [polling, setPollingState] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tx, setTx] = useState("");

  const handleActivationKeyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setActivationKey(event.target.value.trim());
    },
    []
  );

  const { refetch: nonceRefetch } = useActivationKeyNonceQuery({
    variables: {
      encodedActivationKey: activationKey,
    },
  });

  const { refetch: txNoceRefetch } = useGetNextTxNonceQuery({
    variables: {
      address: accountStore.selectedAddress,
    },
  });

  const [stage] = useStageTxMutation();

  const handleActivationKeySubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await makeTx();
  };

  const stageTx = async () => {
    if (tx === "") {
      return;
    }

    setPollingState(true);
    const stageResult = await stage({
      variables: {
        encodedTx: tx,
      },
    });

    if (stageResult.data?.stageTx) {
      while (true) {
        await sleep(1000);
        if (await activated()) {
          setPollingState(false);
          return;
        }
      }
    }
  };

  const makeTx = async () => {
    // get key nonce.
    setTx("");
    setErrorMsg("");
    setPollingState(true);
    const ended = async () => {
      return await nonceRefetch();
    };
    let nonce;
    try {
      const res = await ended();
      nonce = res.data.activationKeyNonce;
    } catch (e) {
      setErrorMsg(e.message);
      setPollingState(false);
      return;
    }

    // create action.
    const fileName = await tmpName();
    if (
      !ipcRenderer.sendSync("activate-account", activationKey, nonce, fileName)
    ) {
      setPollingState(false);
      setErrorMsg("create activate account action failed.");
      return;
    }

    // get tx nonce.
    const ended2 = async () => {
      return await txNoceRefetch({ address: accountStore.selectedAddress });
    };
    let txNonce;
    try {
      const res = await ended2();
      txNonce = res.data.transaction.nextTxNonce;
    } catch (e) {
      setErrorMsg(e.message);
      setPollingState(false);
      return;
    }

    // sign tx.
    const result = ipcRenderer.sendSync(
      "sign-tx",
      txNonce,
      new Date().toISOString(),
      fileName
    );
    if (result.stderr != "") {
      setErrorMsg(result.stderr);
    }
    if (result.stdout != "") {
      setTx(result.stdout);
    }
    setPollingState(false);
    return;
  };

  const activated = async () => {
    const result = await activationRefetch();
    return result.data.activationStatus.addressActivated;
  };

  useEffect(() => {
    if (standaloneStore.Ready) {
      activation();
    }
  }, [standaloneStore.Ready]);

  useEffect(() => {
    if (activationKey !== "") {
      makeTx();
    }
  }, []);

  useEffect(() => {
    if (!polling && tx !== "" && !status?.activationStatus.addressActivated) {
      stageTx();
    }
  }, [polling, tx, status]);

  let child: JSX.Element;
  // FIXME The polling does not resolve even after activation fails.
  if (loading || polling) {
    child = (
      <div>
        <p className={classes.verifing}>
          <T _str="Verifying..." _tags={transifexTags} />
        </p>
        <CircularProgress />
      </div>
    );
  } else if (!standaloneStore.Ready) {
    child = <PreloadWaitingButton />;
  } else if (status?.activationStatus.addressActivated) {
    child = <GameStartButton {...props} />;
  } else {
    child = (
      <form onSubmit={handleActivationKeySubmit}>
        <TextField
          error={errorMsg !== ""}
          label={<T _str="Activation Code" _tags={transifexTags} />}
          onChange={handleActivationKeyChange}
          fullWidth
        />
        {errorMsg !== "" && (
          <FormHelperText>
            {/* FIXME Categorize as an exception type and message i18n */}
            {errorMsg?.split("\n")?.shift()?.split(":")?.pop()?.trim()}
          </FormHelperText>
        )}
        <ButtonOrigin
          color="primary"
          variant="contained"
          className={classes.activation}
          type="submit"
        >
          <T _str="Activation" _tags={transifexTags} />
        </ButtonOrigin>
      </form>
    );
  }
  return <Container>{child}</Container>;
});

const PreloadWaitingButton = () => {
  return (
    <Button disabled={true} className={lobbyViewStyle().gameStartButton}>
      <T _str="Preloading..." _tags={transifexTags} />
    </Button>
  );
};

const GameStartButton = observer((props: ILobbyViewProps) => {
  const { accountStore, gameStore, standaloneStore } = props;
  const [shouldAutostart, setShouldAutostart] = useState(get("LaunchPlayer"));
  const classes = lobbyViewStyle();
  const handleStartGame = () => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/Unity Player Start");
    gameStore.startGame(accountStore.privateKey);
    props.onLaunch();
  };

  useEffect(() => {
    if (standaloneStore.Ready && shouldAutostart) {
      handleStartGame();
      setShouldAutostart(false);
    }
  }, [standaloneStore.Ready, shouldAutostart]);

  return (
    <Button
      disabled={gameStore.isGameStarted}
      onClick={handleStartGame}
      className={classes.gameStartButton}
      id="start-game"
    >
      {gameStore.isGameStarted ? (
        <T _str="Now Running..." _tags={transifexTags} />
      ) : (
        <T _str="Start Game" _tags={transifexTags} />
      )}
    </Button>
  );
});

export default inject(
  "accountStore",
  "gameStore",
  "standaloneStore"
)(LobbyView);
