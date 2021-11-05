import { Button, makeStyles } from "@material-ui/core";
import React from "react";
import { Reward } from "../../../../collection/types";
import RewardItemComponent from "../RewardItem/RewardItemComponent";

import GoldBox from "../../../resources/staking_box_01.png";

import "./ReceivedDialog.scss";

const receivedDialogStyle = makeStyles({
  button: {
    width: "189px",
    height: "48px",
    fontWeight: "bold",
    fontSize: "larger",
    borderRadius: "0",
  },
});

export type Props = {
  rewards: Reward[];
  onClick: () => void;
};

const ReceivedDialog: React.FC<Props> = (props: Props) => {
  const { rewards, onClick } = props;
  const classes = receivedDialogStyle();
  return (
    <div className="ReceivedDialogContainer">
      <div className="ReceivedDialogTitle">Reward Received!</div>
      <div>
        <img src={GoldBox} />
      </div>
      <div className="ReceivedDialogItemList">
        {rewards.map((x, i) => (
          <RewardItemComponent reward={x} key={i} />
        ))}
      </div>
      <div>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={() => {
            onClick();
          }}
        >
          OK
        </Button>
      </div>
    </div>
  );
};

export default ReceivedDialog;
