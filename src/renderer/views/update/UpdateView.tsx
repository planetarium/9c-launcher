import React from "react";
import { observer } from "mobx-react";
import {
    Box,
    Container,
    Typography,
    LinearProgress,
  } from "@material-ui/core";
import YouTube, { Options as IYoutubeOption } from "react-youtube";
import useStores from "../../../hooks/useStores";

const UpdateView = observer(() =>{
    const [isExtract] = React.useState(false);
    const [isDownload] = React.useState(false);
    const [variant] = React.useState<"indeterminate" | "determinate" | undefined>("determinate");
    // FIXME: file lock이 제대로 걸려있지 않아서 파일을 여러 번 받아서 프로그레스가 뒤로 가는 경우가 있습니다.
    const [progress] = React.useState(0);
    const videoOpts: IYoutubeOption = {
        width: "600",
        playerVars: {
          autoplay: 1,
        },
      };

    return (
    <Container
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <Box m="auto" width="80%">
        <YouTube videoId="Dfyugzqgd2M" opts={videoOpts} />
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress variant={variant} value={progress} />
          </Box>
          {variant === "determinate" && (
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">{`${Math.round(
                progress
              )}%`}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="caption">
          {isDownload
            ? "Downloading the new version..."
            : isExtract
            ? "Extracting the new version..."
            : "Copying files..."}
        </Typography>
      </Box>
    </Container>
  );
});

export default UpdateView;