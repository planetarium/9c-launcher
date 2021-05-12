import React from "react";
import TextButton from "../TextButton";

export type Props = {
  loading: boolean;
  onClick: () => void;
}

const RewardButton: React.FC<Props> = (props: Props) => {
  const {loading, onClick} = props;
  return <TextButton className={'RewardButtonContainer'} disabled={loading} onClick={onClick}>{loading ? "Loading..." : "Claim Reward"}</TextButton>
}

export default RewardButton;
