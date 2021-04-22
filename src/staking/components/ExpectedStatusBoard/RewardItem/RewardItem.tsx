import React from "react";
import { RewardCategory } from "src/staking/types";

export type Props = {
  item: RewardCategory
  left: number
  right: number
}

const RewardItem: React.FC<Props> = (props: Props) => {
  const {item, left, right} = props;
  return <div>
    <div>
    {
      left === right ? left : `${left} -> ${right}`
    }
    </div>
    <div>
      image
    </div>
  </div>
}

export default RewardItem;
