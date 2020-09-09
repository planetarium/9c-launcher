import {
  LinearProgressProps,
  Box,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import React from "react";

const LinearProgressWithLabel = (
  props: LinearProgressProps & { value: number }
) => {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">
          {/* eslint-disable-next-line react/destructuring-assignment */}
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default LinearProgressWithLabel;
