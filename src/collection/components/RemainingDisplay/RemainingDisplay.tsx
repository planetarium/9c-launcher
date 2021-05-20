import React from "react";
import starIcon from "../../common/resources/bg-staking-popup-acc-01.png";

import './RemainingDisplay.scss'

export type Props = {
  remainMin: number;
  isCollected: boolean;
}

const getRemain = (remainHour: number) => {
  const hour = remainHour / 60;

  const days = hour / 12;
  if(days >= 1) return `${Math.round(days)} days`

  if(hour >= 1) return `${Math.round(hour)} hours`

  return `less then an hour`
}

const RemainingDisplay: React.FC<Props> = (props: Props) => {
  const {remainMin, isCollected} = props;

  return (<div className="RemainingDisplayContainer">
    <div className="RemainingDisplayTitle">
      The monsters are playing happlly
    </div>
    <div className="RemainingDisplayLabel">
      <img src={starIcon}/>
      <div className='label'>
      {
        isCollected 
          ? <>Reward Remaining Time: <div className='remain'>{getRemain(remainMin)}</div></>
          : `Click the Edit button to collect monsters!`
      }
        
      </div>
      <img src={starIcon}/>
    </div>
  </div>)
}

export default RemainingDisplay;
