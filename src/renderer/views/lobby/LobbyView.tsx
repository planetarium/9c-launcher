import * as React from "react";
import {
  Button as ButtonOrigin,
  ButtonProps,
  Container,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import mixpanel from "mixpanel-browser";
import { IStoreContainer } from "../../../interfaces/store";
import { inject, observer } from "mobx-react";
import {
  useActivationQuery,
  useActivateMutation,
} from "../../../generated/graphql";
import lobbyViewStyle from "./LobbyView.style";

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
  const { accountStore, gameStore, standaloneStore } = props;
  const {
    loading,
    error: statusError,
    data: status,
    refetch,
  } = useActivationQuery();
  const [
    activate,
    { data: isActivated, error: activatedError },
  ] = useActivateMutation();
  const [activationKey, setActivationKey] = React.useState("");
  const [polling, setPollingState] = React.useState(false);

  const handleActivateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
        const value = await refetch();
        if (value.data.activationStatus.activated) break;
      }
      setPollingState(false);
    });
  };

  const privateKeyChangeHandle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setActivationKey(event.target.value);
    },
    [event]
  );

  const handleIsActivationSuccess = React.useCallback(() => {
    if (activatedError?.message !== undefined) {
      return true;
    }
    return false;
  }, [activatedError]);

  let child: JSX.Element;

  if (loading || polling) {
    child = <p className={classes.verifing}>Verifing...</p>;
  } else if (!standaloneStore.IsPreloadEnded) {
    child = <PreloadWaitingButton />;
  } else if (status?.activationStatus.activated) {
    child = <GameStartButton {...props} />;
  } else {
    child = (
      <form onSubmit={handleActivateSubmit}>
        <TextField
          error={handleIsActivationSuccess()}
          label="Activation Key"
          onChange={privateKeyChangeHandle}
          fullWidth
        />
        <ButtonOrigin
          color="primary"
          variant="contained"
          className={classes.activation}
          type="submit"
        >
          Activation
        </ButtonOrigin>
      </form>
    );
  }
  return <Container>{child}</Container>;
});

const PreloadWaitingButton = () => {
  return (
    <Button disabled={true} className={lobbyViewStyle().gameStartButton}>
      Preloading...
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

  React.useEffect(() => {
    if (standaloneStore.IsPreloadEnded) {
      handleStartGame();
    }
  }, [standaloneStore.IsPreloadEnded]);

  return (
    <Button
      disabled={gameStore.isGameStarted}
      onClick={handleStartGame}
      className={classes.gameStartButton}
    >
      {gameStore.isGameStarted ? "Now Running..." : "Start Game"}
    </Button>
  );
});

export default inject(
  "accountStore",
  "gameStore",
  "standaloneStore"
)(LobbyView);
