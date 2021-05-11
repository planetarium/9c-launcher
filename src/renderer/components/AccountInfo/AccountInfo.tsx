import React from "react"
import goldIcon from '../../resources/gold.png'
import monsterIcon from '../../resources/monster.png'

import './AccountInfo.scss'

export type Props = {
  minedBlock: number;
  goldLabel: string | number;
  stakingLabel: string | number;
  onReward: (address: string) => void;
  onOpenWindow: () => void;
  canClaimReward: boolean
}

const AccountInfo: React.FC<Props> = (props: Props) => {
  const {minedBlock, goldLabel, stakingLabel, onOpenWindow} = props;

  const numberWithComma = (number:string|number)=>{
    if(typeof number === 'string') return number;
    return Number.parseInt(number.toString()).toLocaleString();
  }

  return <div className='AccountInfoContainer'>
    <div className={'AccountInfoItem'}>
      <img className={'Icon'} src={goldIcon} alt='gold'/>
      <div className={'value'}>{numberWithComma(goldLabel)}</div>
      <div className={'subText'}>{`(Mined ${minedBlock} blocks)`}</div>
    </div>
    <div className={'AccountInfoItem Monster'} onClick={() => {onOpenWindow()}}>
      <img className={'Icon'} src={monsterIcon} alt='monster'/>
      <div className={'value'}>{numberWithComma(stakingLabel)}</div>
      <div className={'subText'}>{`(Remaning ${0} days)`}</div>
    </div>
  </div>
}

export default AccountInfo
