import { Button } from "@material-ui/core";
import React from "react"
import { Reward } from "../../../../staking/types";
import RewardItemComponent from "../RewardItem/RewardItemComponent";

import './ReceivedDialog.scss';

export type Props = {
  rewards: Reward[]
  onClick: () => void;
}

const ReceivedDialog:React.FC<Props> = (props: Props) => {
  const {rewards, onClick} = props;
  return <div className='ReceivedDialogContainer'>
    <div>
      Reward Received!
    </div>
    <div>
      image
    </div>
    <div>
    {
      rewards.map(x => <RewardItemComponent reward={x} />)
    }
    </div>
    <div>
      <Button color='primary' variant='text' onClick={() => {onClick()}}>OK</Button>
    </div>
  </div>
}

export default ReceivedDialog;
