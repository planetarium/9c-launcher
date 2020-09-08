import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  Button as ButtonOrigin,
  ButtonProps,
  Container,
  TextField,
} from "@material-ui/core";
import mixpanel from "mixpanel-browser";
import { inject, observer } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  useActivateMutation,
  useActivationLazyQuery,
} from "../../../generated/graphql";
import lobbyViewStyle from "./LobbyView.style";

import { useLocale } from "../../i18n";

interface ILobbyViewProps extends IStoreContainer {
  onLaunch: () => void;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Button = (
  props: Omit<ButtonProps, "fullWidth" | "variant" | "color">
) => <ButtonOrigin fullWidth variant="contained" color="primary" {...props} />;

const LobbyView = observer((props: ILobbyViewProps) => {
  const classes = lobbyViewStyle();
  const { standaloneStore } = props;
  const [activation, { loading, data: status }] = useActivationLazyQuery();
  const [activate, { error: activatedError }] = useActivateMutation();
  const [activationKey, setActivationKey] = useState("");
  const [polling, setPollingState] = useState(false);

  const { locale } = useLocale("lobby");

  const handleActivateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    activate({
      variables: {
        encodedActivationKey: activationKey,
      },
    }).then(async (value) => {
      if (!value.data?.activationStatus?.activateAccount) return;
      setPollingState(true);
      while (true) {
        await sleep(1000);
        await activation();
        if (status?.activationStatus.activated) break;
      }
      setPollingState(false);
    });
  };

  const privateKeyChangeHandle = (event: ChangeEvent<HTMLInputElement>) => {
    setActivationKey(event.target.value);
  };

  const handleIsActivationSuccess = useCallback(() => {
    if (activatedError?.message !== undefined) {
      return true;
    }
    return false;
  }, [activatedError]);

  useEffect(() => {
    if (
      standaloneStore.IsPreloadEnded &&
      standaloneStore.IsSetPrivateKeyEnded
    ) {
      activation();
    }
  }, [standaloneStore.IsPreloadEnded, standaloneStore.IsSetPrivateKeyEnded]);

  let child: JSX.Element;

  if (loading || polling) {
    child = <p className={classes.verifing}>{locale("Verifying...")}</p>;
  } else if (!standaloneStore.IsPreloadEnded) {
    child = <PreloadWaitingButton />;
  } else if (status?.activationStatus.activated) {
    child = <GameStartButton {...props} />;
  } else {
    child = (
      <form onSubmit={handleActivateSubmit}>
        <TextField
          error={handleIsActivationSuccess()}
          label={locale("Activation Key")}
          onChange={privateKeyChangeHandle}
          fullWidth
        />
        <ButtonOrigin
          color="primary"
          variant="contained"
          className={classes.activation}
          type="submit"
        >
          {locale("Activation")}
        </ButtonOrigin>
      </form>
    );
  }
  return <Container>{child}</Container>;
});

const PreloadWaitingButton = () => {
  const { locale } = useLocale("lobby");
  return (
    <Button disabled className={lobbyViewStyle().gameStartButton}>
      {locale("Preloading...")}
    </Button>
  );
};

const GameStartButton = observer((props: ILobbyViewProps) => {
  const { accountStore, gameStore, standaloneStore } = props;
  const classes = lobbyViewStyle();
  const handleStartGame = () => {
    mixpanel.track("Launcher/Unity Player Start");
    gameStore.startGame(accountStore.privateKey);
    props.onLaunch();
  };

  const { locale } = useLocale("lobby");

  useEffect(() => {
    if (standaloneStore.IsPreloadEnded) {
      handleStartGame();
    }
  }, [standaloneStore.IsPreloadEnded]);

  return (
    <Button
      disabled={gameStore.isGameStarted}
      onClick={handleStartGame}
      className={classes.gameStartButton}
      id="start-game"
    >
      {gameStore.isGameStarted
        ? `${locale("Now Running...")}`
        : `${locale("Start Game")}`}
    </Button>
  );
});

export default inject("standaloneStore")(LobbyView);
