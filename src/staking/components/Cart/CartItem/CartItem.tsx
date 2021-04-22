import React from "react";
import { getMonsterImageFromTier } from "../../../common/utils";
import { StakingItemModel } from "../../../models/staking";
import { StakingItemTier, StakingPhase } from "../../../types";
import LockImage from "../../../common/resources/ui-staking-slot-lock.png";
import CancelImage from "../../../common/resources/cancel_button.png";
import GoldImage from "../../../common/resources/gold.png";

import './CartItem.scss';

export type Props = {
    item: StakingItemModel
    canStake: boolean
    onPush: (item: StakingItemModel) => void,
    onRemove: (tier: StakingItemModel) => void,
}

type MonsterItemProps = {
    icon: string
    item: StakingItemModel
    onRemove: (tier: StakingItemModel) => void,
}

type AddItemProps = {
    item: StakingItemModel
    onPush: (item: StakingItemModel) => void
}


const LockItem: React.FC = () => {
    return (
    <div>
        <img src={LockImage} className={'LockIcon'} />
    </div>
    )
}

const AddItem: React.FC<AddItemProps> = (props: AddItemProps) => {
    const {item, onPush} = props;
    return (
    <div className={'AddItem'} onClick={() => {onPush(item)}}>
    </div>
    )
}

const MonsterItem: React.FC<MonsterItemProps> = (props: MonsterItemProps) => {
    const { icon, item, onRemove } = props;
    return (
    <div>
        <img className={'CartIcon'} src={require(`../../../common/resources/${icon}.png`).default} />
        {
            item.stakingPhase === StakingPhase.LATEST ? <img className='RemoveButton' src={CancelImage} onClick={() => {onRemove(item)}} /> : <></>
        }
    </div>)
}

const CartItem: React.FC<Props> = (props: Props) => {
    const {item, canStake, onPush, onRemove} = props;

    const getResource = (tier: StakingItemTier) => {
        return getMonsterImageFromTier(tier);
    }

    const getComponent = (item: StakingItemModel) => {
        if(item.stakingPhase === StakingPhase.LOCKED) return <LockItem />
        else if(item.stakingPhase === StakingPhase.CANDIDATE) return <AddItem item={item} onPush={canStake ? onPush : ()=>{}} />
        else return <MonsterItem icon={getResource(item.tier)} item={item} onRemove={onRemove} />
    }

    return (
        <div className={'CartItemContainer'}>
            <div className={`CartIconContainer ${item.stakingPhase === StakingPhase.CANDIDATE ? 'CandidateItemBackground' : 'StakingImageBackground'}`}>
                {
                    getComponent(item)
                }
            </div>
            <img className={'GoldIcon'} src={GoldImage} />
            <div className={'CartValueContainer'}>
              <div className={canStake ? '' : 'RedFontColor'} >
                  {item.value}
              </div>
            </div>

    </div>
    )
}

export default CartItem;
