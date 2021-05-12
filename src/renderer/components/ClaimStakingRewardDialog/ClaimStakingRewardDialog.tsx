import React, { useState } from "react"
import { useClaimStakeRewardMutation } from "../../..//generated/graphql";
import { Reward } from "../../../staking/types"
import CharSelectDialog from "./CharSelectDialog/CharSelectDialog";
import ReceivedDialog from "./ReceivedDialog/ReceivedDialog";

export type Props = {
  rewards: Reward[]
  avatar: {address: string, name: string}[]
  onActionTxId: (txId: string) => void;
}

const ClaimStakingRewardDialog: React.FC<Props> = (props: Props) => {
  const {rewards, avatar, onActionTxId} = props;
  const [step, setStep] = useState<number>(0);
  const [claim] = useClaimStakeRewardMutation();
  const handleStep = () => setStep(step + 1);
  const handleSubmit = async (address: string) => {
    const result = await claim({variables: {
      address: address
    }});
    console.log(`action: ${JSON.stringify(result)}`)
    onActionTxId(result.data?.action?.claimStakingReward);
  }

  switch(step) {
    case 0:
      return <ReceivedDialog rewards={rewards} onClick={avatar.length === 1 ? () => handleSubmit(avatar[0].address) : handleStep}/>
    
    case 1:
      return <CharSelectDialog avatar={avatar} onClick={handleSubmit}/>
    default:
      return <></>
  }
}

export default ClaimStakingRewardDialog
