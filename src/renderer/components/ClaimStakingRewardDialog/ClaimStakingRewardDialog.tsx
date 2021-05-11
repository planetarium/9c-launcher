import React, { useState } from "react"
import { Reward } from "../../../staking/types"
import CharSelectDialog from "./CharSelectDialog/CharSelectDialog";
import ReceivedDialog from "./ReceivedDialog/ReceivedDialog";

export type Props = {
  rewards: Reward[]
  avatarAddresses: string[],
  onActionTxId: (address: string) => void;
}

const ClaimStakingRewardDialog: React.FC<Props> = (props: Props) => {
  const {rewards, avatarAddresses, onActionTxId} = props;
  const [step, setStep] = useState<number>(0);
  const handleStep = () => setStep(step + 1);
  const handleSubmit = () => {}
  switch(step) {
    case 0:
      return <ReceivedDialog rewards={rewards} onClick={avatarAddresses.length > 1 ? handleStep : handleSubmit}/>
    case 1:
      return <CharSelectDialog />
    default:
      return <></>
  }
}

export default ClaimStakingRewardDialog
