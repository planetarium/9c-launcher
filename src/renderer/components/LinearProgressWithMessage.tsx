import { createStyles, LinearProgress, makeStyles, withStyles } from "@material-ui/core";
import React from "react";

type LinearProgressWithMessageProps = {
  message: string;
  variant: "buffer" | "determinate" | "indeterminate" | "query";
  value: number;
  valueBuffer?: number;
};

const LinearProgressWithMessageStyle = makeStyles({
  root: {
    position: "absolute",
    top: 679,
    left: 594,
  },
  message: {
    margin: 0,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textShadow: "0 2px 3px rgba(0, 0, 0, 0.5)",
  },
});

const LinearProgressWithMessage = ({message, variant, value, valueBuffer}: LinearProgressWithMessageProps) => {
  const styles = LinearProgressWithMessageStyle();
  const StyledLinearProgress = withStyles(() =>
    createStyles({
      root: {
        width: 489,
        height: 14,
        marginTop: 8,
        borderRadius: 5,
      },
      colorPrimary: {
        backgroundColor: "rgba(19, 19, 19, 0.8)",
      },
      bar: {
        borderRadius: 5,
        backgroundColor: '#20d1c3',
      },
    })
    )(LinearProgress);

  return (
    <div className={styles.root}>
      <p className={styles.message}>{message}</p>
      <StyledLinearProgress variant={variant} value={value} valueBuffer={valueBuffer} />
      {/* {
        variant === "buffer"
          ? (<LinearProgress variant={variant} value={value} valueBuffer={valueBuffer} />)
          : (<LinearProgress variant={variant} value={value} />)
      } */}
    </div>
  );
};

export default LinearProgressWithMessage;
