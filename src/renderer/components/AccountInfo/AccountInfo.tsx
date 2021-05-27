import React from "react"
import goldIcon from '../../resources/gold.png'
import monsterIcon from '../../resources/monster.png'

import './AccountInfo.scss'

export type Props = {
  minedBlock: number;
  remainText: string;
  goldLabel: string | number;
  collectionLabel: string | number;
  isCollecting: boolean;
  onOpenWindow: () => void;
  canClaimReward: boolean
}

const AccountInfo: React.FC<Props> = (props: Props) => {
  const {minedBlock, remainText, goldLabel, collectionLabel, isCollecting, onOpenWindow} = props;

  const numberWithComma = (number:string|number)=>{
    if(typeof number === 'string') return number;
    return number.toLocaleString();
  }

  const decorateRemainText = () => {
    if(!isCollecting) return `(-)`
    return `(Remaning ${remainText})`
  }

  return <div className='AccountInfoContainer'>
    <div className={'AccountInfoItem'}>
      <img className={'Icon'} src={goldIcon} alt='gold'/>
      <div className={'value'}>{numberWithComma(goldLabel)}</div>
      {
        typeof goldLabel !== "string" && <div className={'subText'}>{`(Mined ${minedBlock} blocks)`}</div>
      }
    </div>
    <div className={'AccountInfoItem Monster'} onClick={() => {onOpenWindow()}}>
      <img className={'Icon'} src={monsterIcon} alt='monster'/>
      <div className={'value'}>{numberWithComma(collectionLabel)}</div>
      {
        typeof collectionLabel !== 'string' && <div className={'subText'}>{decorateRemainText()}</div>
      }
    </div>
  </div>
}

export default AccountInfo
