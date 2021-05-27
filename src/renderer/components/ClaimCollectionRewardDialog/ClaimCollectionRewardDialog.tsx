import React, { useState } from "react"
import { useClaimCollectionRewardMutation } from "../../../generated/graphql";
import { Reward } from "../../../collection/types"
import CharSelectDialog from "./CharSelectDialog/CharSelectDialog";
import ReceivedDialog from "./ReceivedDialog/ReceivedDialog";

export type Props = {
  rewards: Reward[]
  avatar: {address: string, name: string, updatedAt: number}[]
  tip: number
  onActionTxId: (txId: string) => void;
}

const ClaimCollectionRewardDialog: React.FC<Props> = (props: Props) => {
  const {rewards, avatar, tip, onActionTxId} = props;
  const [step, setStep] = useState<number>(0);
  const [claim] = useClaimCollectionRewardMutation();
  const handleStep = () => setStep(step + 1);
  const handleSubmit = async (address: string) => {
    const result = await claim({variables: {
      address: address
    }});
    onActionTxId(result.data?.action?.claimMonsterCollectionReward);
  }

  switch(step) {
    case 0:
      return <ReceivedDialog rewards={rewards} onClick={avatar.length === 1 ? () => handleSubmit(avatar[0].address) : handleStep}/>
    
    case 1:
      return <CharSelectDialog avatar={avatar.sort((x, y) => y.updatedAt - x.updatedAt)} tip={tip} onClick={handleSubmit}/>
    default:
      return <></>
  }
}

export default ClaimCollectionRewardDialog
