import React from "react";
import styles from "./styles.module.scss";

interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return <progress className={styles.progressBar} max="100" value={percent} />;
}
