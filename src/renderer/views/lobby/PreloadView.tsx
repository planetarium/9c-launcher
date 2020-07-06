import { shell } from "electron";
import React from "react";
import YouTube from "react-youtube";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import GrainIcon from "@material-ui/icons/Grain";
import { LinearProgressWithLabel } from "../../components/LinerProgressWithLabel";
import {
  useNodeStatusSubscriptionSubscription,
  usePreloadProgressSubscriptionSubscription,
} from "../../../generated/graphql";

enum PreloadProgressPhase {
  ActionExecutionState,
  BlockDownloadState,
  BlockHashDownloadState,
  BlockVerificationState,
  StateDownloadState,
}

const PreloadView = observer((props: IStoreContainer) => {
  const { routerStore } = props;

  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();

  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const isEnded = nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded;
    if (isEnded) {
      routerStore.push("/lobby");
    }
  }, [nodeStatusSubscriptionResult?.nodeStatus?.preloadEnded]);

  React.useEffect(() => {
    const prog = getProgress(
      preloadProgressSubscriptionResult?.preloadProgress?.extra.currentCount,
      preloadProgressSubscriptionResult?.preloadProgress?.extra.totalCount
    );
    setProgress(prog);
  }, [preloadProgressSubscriptionResult?.preloadProgress?.extra]);

  const videoOpts = {
    width: 330,
    height: 220,
    playerVars: {
      autoPlay: 1,
    },
  };

  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;
  let status: string = "Connecting to the network...";
  const steps: string = `(${preloadProgress?.currentPhase}/${preloadProgress?.totalPhase})`;
  const phase: PreloadProgressPhase =
    PreloadProgressPhase[preloadProgress?.extra.type];
  switch (phase) {
    case PreloadProgressPhase.ActionExecutionState:
      status = `Executing actions... ${steps}`;

    case PreloadProgressPhase.BlockDownloadState:
      status = `Downloading blocks... ${steps}`;

    case PreloadProgressPhase.BlockHashDownloadState:
      status = `Downloading block hashes... ${steps}`;

    case PreloadProgressPhase.BlockVerificationState:
      status = `Verifying block headers... ${steps}`;

    case PreloadProgressPhase.StateDownloadState:
      status = `Downloading states... ${steps}`;
  }

  const handleClickBlockExplorer = () => {
    shell.openExternal("https://explorer.libplanet.io/9c-beta/");
  };

  const handleClickPlayerGuide = () => {
    shell.openExternal(
      "https://forum.nine-chronicles.com/t/nine-chronicles-quick-game-guide/31"
    );
  };

  const Headline = styled(Typography)({
    marginTop: "60px",
    fontWeight: "bold",
    lineHeight: 1.25,
  });

  return (
    <Container>
      <Headline paragraph variant="outline">
        Receiving data from other users. <br />
        Let's watch teaser and contents!
      </Headline>
      <YouTube videoId="Kf-7NXLVLOE" opts={videoOpts} />
      <List component="nav">
        <ListItem button onClick={handleClickBlockExplorer}>
          <ListItemIcon>
            <GrainIcon />
          </ListItemIcon>
          <ListItemText primary="Block Explorer" />
        </ListItem>
        <ListItem button onClick={handleClickPlayerGuide}>
          <ListItemIcon>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText primary="Nine Chronicles Player Guide" />
        </ListItem>
      </List>
      {!!preloadProgress && <LinearProgressWithLabel value={progress} />}
      <Typography align="center" display="block" variant="caption">
        {status}
      </Typography>
    </Container>
  );
});

const getProgress = (
  current: number | undefined,
  total: number | undefined
) => {
  if (current === undefined) return 0;
  if (total === undefined) return 0;
  return total === 0 ? 0 : Math.round((current / total) * 100);
};

export default inject("routerStore")(PreloadView);
