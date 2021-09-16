import {
  Button as ButtonOrigin,
  ButtonProps,
  CircularProgress,
  Container,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import {inject, observer} from "mobx-react";
import React, {ChangeEvent, FormEvent, useCallback, useEffect, useState,} from "react";
import {
  useActivateMutation,
  useActivationAddressLazyQuery,
  useActivationKeyNonceQuery,
  useGetNextTxNonceQuery,
  useStageTxMutation,
} from "../../../generated/graphql";
import {IStoreContainer} from "../../../interfaces/store";
import {sleep} from "../../../utils";
import {ipcRenderer} from "electron";

import {T} from "@transifex/react";

import lobbyViewStyle from "./LobbyView.style";
import {tmpName} from "tmp-promise";
import moment from "moment";

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
  const [
    activation,
    { loading, error: statusError, data: status, refetch: activationRefetch },
  ] = useActivationAddressLazyQuery({
    variables: {
      address: accountStore.selectedAddress
    }
  });
  const [
    activate,
    { data: isActivated, error: activatedError },
  ] = useActivateMutation();
  const [activationKey, setActivationKey] = useState(
    accountStore.activationKey
  );
  const [polling, setPollingState] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tx, setTx] = useState("");

  const handleActivationKeyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setActivationKey(event.target.value);
    },
    [event]
  );

  const { refetch: nonceRefetch } = useActivationKeyNonceQuery({
    variables: {
      encodedActivationKey: activationKey
    }
  });

  const { refetch: txNoceRefetch } = useGetNextTxNonceQuery({
    variables: {
      address: accountStore.selectedAddress
    }
  })

  const [
    stage,
    { data: isStage, error: stageError },
  ] = useStageTxMutation();
  
  const handleActivationKeySubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await makeTx();
  };


  const activateMutation = async() => {
    if (tx !== "")
    {
      setPollingState(true);
      const stageResult = await stage({
        variables: {
          encodedTx: tx
        }
      });

      if (stageResult.data?.stageTx)
      {
        while (true) {
          await sleep(1000);
          if (await activated()) {
            setPollingState(false);
            return;
          }
        }
      }
    }
  }

  const makeTx = async() => {
    // get key nonce.
    setTx("");
    setErrorMsg("");
    setPollingState(true);
    const ended = async () => {
      return await nonceRefetch();
    }
    let nonce;
    try {
      let res = await ended();
      nonce = res.data.activationKeyNonce;
    }
    catch (e) {
      setErrorMsg(e.message);
      setPollingState(false);
      return;
    }

    // create action.
    const fileName = await tmpName();
    if (!ipcRenderer.sendSync("activate-account", activationKey, nonce, fileName))
    {
      setPollingState(false);
      setErrorMsg("create activate account action failed.")
      return;
    }

    // get tx nonce.
    const ended2 = async () => {
      return await txNoceRefetch({address: accountStore.selectedAddress});
    }
    let txNonce;
    try {
      let res = await ended2();
      txNonce = res.data.transaction.nextTxNonce;
    }
    catch (e) {
      setErrorMsg(e.message);
      setPollingState(false);
      return;
    }

    // sign tx.
    const result = ipcRenderer.sendSync("sign-tx", accountStore.privateKey, txNonce, moment().utc().format(), fileName);
    if (result.stderr != "")
    {
      setErrorMsg(result.stderr);
    }
    if (result.stdout != "")
    {
      setTx(result.stdout);
    }
    setPollingState(false);
    return;
  }

  const activated = async () => {
    const result = await activationRefetch();
    return result.data.activationStatus.addressActivated;
  };

  useEffect(() => {
    if (standaloneStore.Ready && standaloneStore.IsSetPrivateKeyEnded) {
      activation();
    }
  }, [standaloneStore.Ready, standaloneStore.IsSetPrivateKeyEnded]);

  if (!polling && tx !== "" && !status?.activationStatus.addressActivated)
  {
    activateMutation();
  }

  let child: JSX.Element;
  // FIXME 활성화에 실패한 경우에도 polling이 풀리지 않는 문제가 있습니다.
  if ((loading || polling) && activatedError === undefined) {
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
          label={<T _str="Invitation Code" _tags={transifexTags} />}
          onChange={handleActivationKeyChange}
          fullWidth
        />
        {errorMsg !== "" && (
          <FormHelperText>
            {/* FIXME 예외 타입으로 구분해서 메시지 국제화 할 것 */}
            {errorMsg
              ?.split("\n")
              ?.shift()
              ?.split(":")
              ?.pop()
              ?.trim()}
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
  const [shouldAutostart, setShouldAutostart] = useState(true);
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
