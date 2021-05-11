import React from "react";
import TextButton from "../TextButton";

export type Props = {
  onClick: () => void;
}

const RewardButton: React.FC<Props> = (props: Props) => {
  const {onClick} = props;
  return <TextButton onClick={onClick}>Claim Reward</TextButton>
}

export default RewardButton;
