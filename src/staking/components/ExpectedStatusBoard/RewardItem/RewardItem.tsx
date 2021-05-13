import React from "react";
import { RewardCategory } from "../../../../staking/types";
import goldIcon from '../../../common/resources/gold.png';
import hourglass from '../../../common/resources/hourglass.png';
import apIcon from '../../../common/resources/ap.png';

export type Props = {
  item: RewardCategory | "GOLD"
  left: number
  right: number
}


const getIconFromItem = (item: RewardCategory | "GOLD") => {
  switch(item) {
    case RewardCategory.AP:
      return apIcon;
    case RewardCategory.HOURGLASS:
      return hourglass;
    case "GOLD":
      return goldIcon;
    default:
      return null
  }
}

const RewardItem: React.FC<Props> = (props: Props) => {
  const {item, left, right} = props;
  return <div>
    <img src={getIconFromItem(item) || ""} />
    <div>
    {
      left === right ? left : `${left} -> ${right}`
    }
    </div>
  </div>
}

export default RewardItem;
