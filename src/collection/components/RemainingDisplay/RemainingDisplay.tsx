import React from "react";
import starIcon from "../../common/resources/bg-staking-popup-acc-01.png";

import './RemainingDisplay.scss'

export type Props = {
  remainMin: number;
}

const getRemain = (remainMin: number) => {
  const hour = remainMin / 60;
  return hour === 0 
  ? `Min: ${remainMin}`
  : `Hour: ${Math.round(hour)}`;
}

const RemainingDisplay: React.FC<Props> = (props: Props) => {
  const {remainMin} = props;

  return (<div className="RemainingDisplayContainer">
    <div className="RemainingDisplayTitle">
      The monsters are playing happlly
    </div>
    <div className="RemainingDisplayLable">
      <img src={starIcon}/>
      <div className='label'>
        Reward Remaining Time: <div className='remain'>{getRemain(remainMin)}</div>
      </div>
      <img src={starIcon}/>
    </div>
  </div>)
}

export default RemainingDisplay;
