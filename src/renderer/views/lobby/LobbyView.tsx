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
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  useActivateMutation,
  useActivationLazyQuery,
} from "../../../generated/graphql";
import { IStoreContainer } from "../../../interfaces/store";
import { sleep } from "../../../utils";
import { ipcRenderer } from "electron";

import { T } from "@transifex/react";

import lobbyViewStyle from "./LobbyView.style";

interface ILobbyViewProps extends IStoreContainer {
  onLaunch: () => void;
}

const Button = (
  props: Omit<ButtonProps, "fullWidth" | "variant" | "color">
) => <ButtonOrigin fullWidth variant="contained" color="primary" {...props} />;

const LobbyView = observer((props: ILobbyViewProps) => {
  const classes = lobbyViewStyle();
  const { accountStore, standaloneStore } = props;
  const [
    activation,
    { loading, error: statusError, data: status, refetch: activationRefetch },
  ] = useActivationLazyQuery();
  const [
    activate,
    { data: isActivated, error: activatedError },
  ] = useActivateMutation();
  const [activationKey, setActivationKey] = useState(
    accountStore.activationKey
  );
  const [polling, setPollingState] = useState(false);
  const [hasAutoActivateBegin, setHasAutoActivateBegin] = useState(false);

  const handleActivationKeyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setActivationKey(event.target.value);
    },
    [event]
  );

  const handleActivationKeySubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await activateMutation();
  };

  const activateMutation = async () => {
    setPollingState(true);

    const activated = async () => {
      const result = await activationRefetch();
      return result.data.activationStatus.activated;
    };

    if (await activated()) {
      setPollingState(false);
      return;
    }

    const activateResult = await activate({
      variables: {
        encodedActivationKey: activationKey,
      },
    });

    if (!activateResult.data?.activationStatus?.activateAccount) {
      setPollingState(false);
      return;
    }

    while (true) {
      await sleep(1000);
      if (await activated()) {
        setPollingState(false);
        return;
      }
    }
  };

  useEffect(() => {
    if (standaloneStore.Ready && standaloneStore.IsSetPrivateKeyEnded) {
      activation();
    }
  }, [standaloneStore.Ready, standaloneStore.IsSetPrivateKeyEnded]);

  if (
    !loading &&
    !polling &&
    !status?.activationStatus.activated &&
    activationKey !== "" &&
    !hasAutoActivateBegin &&
    activationRefetch !== undefined
  ) {
    // FIXME 플래그(hasAutoActivateBegin) 없이 useEffect 나 타이밍 잡아서 부르게끔 고쳐야 합니다.
    setHasAutoActivateBegin(true);
    activateMutation();
  }

  let child: JSX.Element;
  // FIXME 활성화에 실패한 경우에도 polling이 풀리지 않는 문제가 있습니다.
  if ((loading || polling) && activatedError === undefined) {
    child = (
      <div>
        <p className={classes.verifing}><T _str="Verifying..." _tags="lobby" /></p>
        <CircularProgress />
      </div>
    );
  } else if (!standaloneStore.Ready) {
    child = <PreloadWaitingButton />;
  } else if (status?.activationStatus.activated) {
    child = <GameStartButton {...props} />;
  } else {
    child = (
      <form onSubmit={handleActivationKeySubmit}>
        <TextField
          error={activatedError?.message !== undefined}
          label={<T _str="Invitation Code" _tags="lobby" />}
          onChange={handleActivationKeyChange}
          fullWidth
        />
        {activatedError?.message !== undefined && (
          <FormHelperText>
            {/* FIXME 예외 타입으로 구분해서 메시지 국제화 할 것 */}
            {activatedError?.message
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
          <T _str="Activation" _tags="lobby" />
        </ButtonOrigin>
      </form>
    );
  }
  return <Container>{child}</Container>;
});

const PreloadWaitingButton = () => {
  return (
    <Button disabled={true} className={lobbyViewStyle().gameStartButton}>
      <T _str="Preloading..." _tags="lobby" />
    </Button>
  );
};

const GameStartButton = observer((props: ILobbyViewProps) => {
  const { accountStore, gameStore, standaloneStore } = props;
  const classes = lobbyViewStyle();
  const handleStartGame = () => {
    ipcRenderer.send("mixpanel-track-event", "Launcher/Unity Player Start");
    gameStore.startGame(accountStore.privateKey);
    props.onLaunch();
  };

  useEffect(() => {
    if (standaloneStore.Ready) {
      handleStartGame();
    }
  }, [standaloneStore.Ready]);

  return (
    <Button
      disabled={gameStore.isGameStarted}
      onClick={handleStartGame}
      className={classes.gameStartButton}
      id="start-game"
    >

      {gameStore.isGameStarted
        ? <T _str="Now Running..." _tags="lobby" />
        : <T _str="Start Game" _tags="lobby" />}
    </Button>
  );
});

export default inject(
  "accountStore",
  "gameStore",
  "standaloneStore"
)(LobbyView);
