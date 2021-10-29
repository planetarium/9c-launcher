import React from "react";
import { RewardCategory } from "../../../types";
import goldIcon from "../../../common/resources/gold.png";
import hourglass from "../../../common/resources/ui-staking-icon-03.png";
import apIcon from "../../../common/resources/ui-staking-icon-02.png";

import "./RewardItem.scss";

export type Props = {
  item: RewardCategory | "GOLD";
  left: number;
  right: number;
};

const getIconFromItem = (item: RewardCategory | "GOLD") => {
  switch (item) {
    case RewardCategory.AP:
      return apIcon;
    case RewardCategory.HOURGLASS:
      return hourglass;
    case "GOLD":
      return goldIcon;
    default:
      return null;
  }
};

const RewardItem: React.FC<Props> = (props: Props) => {
  const { item, left, right } = props;
  return (
    <div className={"RewardItemContainer"}>
      <div>
        <img className={"RewardItemIcon"} src={getIconFromItem(item) || ""} />
      </div>

      <div className={"RewardItemValueContainer"}>
        {left}
        {left !== right && (
          <>
            {" "}
            <div className={"RewardArrow"}>▶</div>{" "}
            <div className={"RewardRight"}>{right}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default RewardItem;
