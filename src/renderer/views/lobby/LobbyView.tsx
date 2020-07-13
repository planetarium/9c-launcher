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

interface ILobbyViewProps extends IStoreContainer {
  onLaunch: () => void;
}

const LobbyView = observer((props: ILobbyViewProps) => {
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

  const handleActivateSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      activate({
        variables: {
          encodedActivationKey: activationKey,
        },
      }).then((value) => {
        value.data?.activationStatus;
      });
    },
    [activationKey]
  );

  const privateKeyChangeHandle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setActivationKey(event.target.value);
    },
    [event]
  );

  const handleIsActivationSuccess = React.useCallback(() => {
    if (isActivated === undefined) return false;
    if (isActivated.activationStatus?.activateAccount) return true;
  }, [isActivated]);

  if (loading) return <p>Verifing...</p>;
  if (status?.activationStatus.activated)
    return (
      <Container>
        <Button
          fullWidth
          disabled={gameStore.isGameStarted}
          variant="contained"
          color="primary"
          onClick={(event: React.MouseEvent) => {
            mixpanel.track("Launcher/Unity Player Start");
            gameStore.startGame(accountStore.privateKey);
            props.onLaunch();
            window.close();
          }}
        >
          {gameStore.isGameStarted ? "Now Running..." : "Start Game"}
        </Button>
      </Container>
    );
  else
    return (
      <Container>
        <form onSubmit={handleActivateSubmit}>
          <TextField
            error={!handleIsActivationSuccess()}
            label="Activation Key"
            onChange={privateKeyChangeHandle}
          />
          <Button type="submit"> Activation</Button>
        </form>
      </Container>
    );
});

export default inject("accountStore", "gameStore")(LobbyView);
