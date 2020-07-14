import * as React from "react";
import {
  Button,
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

const LobbyView = observer((props: ILobbyViewProps) => {
  const classes = lobbyViewStyle();
  const { accountStore, gameStore } = props;
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

  if (loading || polling)
    return <p className={classes.verifing}>Verifing...</p>;
  if (status?.activationStatus.activated) return <GameStartButton {...props} />;
  else
    return (
      <Container>
        <form onSubmit={handleActivateSubmit}>
          <TextField
            error={handleIsActivationSuccess()}
            label="Activation Key"
            onChange={privateKeyChangeHandle}
            fullWidth
          />
          <Button
            color="primary"
            variant="contained"
            className={classes.activation}
            type="submit"
          >
            Activation
          </Button>
        </form>
      </Container>
    );
});

const GameStartButton = observer((props: ILobbyViewProps) => {
  const { accountStore, gameStore } = props;
  const handleStartGame = () => {
    mixpanel.track("Launcher/Unity Player Start");
    gameStore.startGame(accountStore.privateKey);
    props.onLaunch();
  };

  React.useEffect(() => {
    handleStartGame();
  }, []);

  return (
    <Container>
      <Button
        fullWidth
        disabled={gameStore.isGameStarted}
        variant="contained"
        color="primary"
        onClick={handleStartGame}
      >
        {gameStore.isGameStarted ? "Now Running..." : "Start Game"}
      </Button>
    </Container>
  );
});

export default inject("accountStore", "gameStore")(LobbyView);
