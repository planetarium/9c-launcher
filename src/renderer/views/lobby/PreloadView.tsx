import { shell } from "electron";
import React from "react";
import YouTube, { Options as IYoutubeOption } from "react-youtube";
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
import preloadViewStyle from "./PreloadView.style";

enum PreloadProgressPhase {
  ActionExecutionState,
  BlockDownloadState,
  BlockHashDownloadState,
  BlockVerificationState,
  StateDownloadState,
}

const PreloadView = observer((props: IStoreContainer) => {
  const { routerStore } = props;
  const classes = preloadViewStyle();
  const {
    data: preloadProgressSubscriptionResult,
  } = usePreloadProgressSubscriptionSubscription();
  const {
    data: nodeStatusSubscriptionResult,
  } = useNodeStatusSubscriptionSubscription();
  const preloadProgress = preloadProgressSubscriptionResult?.preloadProgress;

  const [progress, setProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState(
    "Connecting to the network..."
  );

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
  }, [preloadProgress?.extra]);

  React.useEffect(() => {
    const steps: string = `(${preloadProgress?.currentPhase}/${preloadProgress?.totalPhase})`;
    // FIXME: preloadProgress가 undefined일 경우 문제가 생길 수 있습니다.
    const phase: PreloadProgressPhase =
      PreloadProgressPhase[preloadProgress?.extra.type];
    switch (phase) {
      case PreloadProgressPhase.ActionExecutionState:
        setStatusMessage(`Executing actions... ${steps}`);
        break;

      case PreloadProgressPhase.BlockDownloadState:
        setStatusMessage(`Downloading blocks... ${steps}`);
        break;

      case PreloadProgressPhase.BlockHashDownloadState:
        setStatusMessage(`Downloading block hashes... ${steps}`);
        break;

      case PreloadProgressPhase.BlockVerificationState:
        setStatusMessage(`Verifying block headers... ${steps}`);
        break;

      case PreloadProgressPhase.StateDownloadState:
        setStatusMessage(`Downloading states... ${steps}`);
        break;
    }
  }, [preloadProgress]);

  const videoOpts: IYoutubeOption = {
    width: "330",
    height: "220",
    playerVars: {
      autoplay: 1,
    },
  };

  const handleClickBlockExplorer = React.useCallback(() => {
    shell.openExternal("https://explorer.libplanet.io/9c-beta/");
  }, []);

  const handleClickPlayerGuide = React.useCallback(() => {
    shell.openExternal(
      "https://forum.nine-chronicles.com/t/nine-chronicles-quick-game-guide/31"
    );
  }, []);

  const Headline = styled(Typography)({
    marginTop: "60px",
    fontWeight: "bold",
    lineHeight: 1.25,
  });

  return (
    <Container className={classes.root}>
      <Headline paragraph>
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
        {statusMessage}
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
