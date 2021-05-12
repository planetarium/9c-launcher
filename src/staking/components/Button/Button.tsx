import React from "react";

import './Button.scss';

export type Props = {
  children: React.ReactNode;
  width: number;
  height: number;
  primary?: boolean;
  onClick: () => void;
};

const StakingButton: React.FC<Props> = (props: Props) => {
  const { children, width, height, primary, onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{ width: width, height: height }}
      className={`ButtonContainer ${primary ? "PrimaryButtonContainer" : "CancelButtonContainer"}`}
    >
      {children}
    </div>
  );
};

export default StakingButton;
