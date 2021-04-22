import React from "react"

export type Props = {
  goldLabel: string | number;
  stakingLabel: string | number;
  onReward: (address: string) => void;
  onOpenWindow: () => void;
  canClaimReward: boolean
}

const AccountInfo: React.FC<Props> = (props: Props) => {
  const {goldLabel, stakingLabel} = props;
  return <div>
    <div>
      <div>gold</div>
      <div>{goldLabel}</div>
    </div>
    <div>
      <div>stake</div>
      <div>{stakingLabel}</div>
    </div>
  </div>
}

export default AccountInfo
