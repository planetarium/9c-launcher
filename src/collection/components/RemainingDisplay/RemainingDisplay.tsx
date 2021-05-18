import React from "react";
import starIcon from "../../common/resources/bg-staking-popup-acc-01.png";

import './RemainingDisplay.scss'

export type Props = {
  remainMin: number;
}

const getRemain = (remainHour: number) => {
  const hour = remainHour / 60;

  const days = hour / 12;
  if(days >= 1) return `${Math.round(days)} days`

  if(hour >= 1) return `${Math.round(hour)} hours`

  return `less then hour`
}

const RemainingDisplay: React.FC<Props> = (props: Props) => {
  const {remainMin} = props;

  return (<div className="RemainingDisplayContainer">
    <div className="RemainingDisplayTitle">
      The monsters are playing happlly
    </div>
    <div className="RemainingDisplayLabel">
      <img src={starIcon}/>
      <div className='label'>
        Reward Remaining Time: <div className='remain'>{getRemain(remainMin)}</div>
      </div>
      <img src={starIcon}/>
    </div>
  </div>)
}

export default RemainingDisplay;
