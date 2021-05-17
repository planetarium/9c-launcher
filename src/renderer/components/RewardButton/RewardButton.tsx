import { Button, makeStyles } from "@material-ui/core";
import React from "react";

export type Props = {
  loading: boolean;
  onClick: () => void;
}

const rewardButtonStyle = makeStyles({
  button: {
    width: "160px",
    height: "30px",
    fontFamily: "Montserrat",
    fontSize: "16px",
    borderRadius: "0",
    backgroundColor: "#dc9c2d",
    color: "white"
  },
});


const RewardButton: React.FC<Props> = (props: Props) => {
  const {loading, onClick} = props;
  const classes = rewardButtonStyle();
  return <Button className={classes.button} variant='contained' disabled={loading} onClick={onClick}>{loading ? "Loading..." : "Get Rewards"}</Button>
}

export default RewardButton;
