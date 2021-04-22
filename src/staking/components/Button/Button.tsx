import React from "react";

import './Button.scss';

export type Props = {
  label: string;
  width: number;
  height: number;
  primary?: boolean;
  onClick: () => void;
};

const StakingButton: React.FC<Props> = (props: Props) => {
  const { label, width, height, primary, onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{ width: width, height: height }}
      className={`ButtonContainer ${primary ? "PrimaryButtonContainer" : "CancelButtonContainer"}`}
    >
      {label}
    </div>
  );
};

export default StakingButton;
