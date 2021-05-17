import React from "react";
import starIcon from "../../common/resources/bg-staking-popup-acc-01.png";

import './RemainingDisplay.scss'

export type Props = {
  remainMin: number;
}

const getRemain = (remainMin: number) => {
  const day = remainMin / 60;
  if(day !== 0) return `${Math.round(day)} days`
  
  const hour = remainMin % 60;
  if(hour !== 0) return `${remainMin} hours`

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
