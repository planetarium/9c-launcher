import React from "react";
import { styled } from "src/renderer/stitches.config";

interface ProgressBarProps {
  percent: number;
}

const Progress = styled("progress", {
  appearance: "none",
  width: "100%",
  height: 15,
  "&::-webkit-progress-value": {
    backgroundColor: "$accent",
  },
  "&::-webkit-progress-bar": {
    backgroundColor: "$gray",
  },
});

export default function ProgressBar({ percent }: ProgressBarProps) {
  return <Progress max="100" value={percent} />;
}
