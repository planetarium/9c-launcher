import React from "react";
import { getCartMonsterImageFromTier, getMonsterImageFromTier } from "../../../common/utils";
import { CollectionItemModel } from "../../../models/collection";
import { CollectionItemTier, CollectionPhase } from "../../../types";
import LockImage from "../../../common/resources/ui-staking-slot-lock.png";
import CancelImage from "../../../common/resources/cancel_button.png";
import GoldImage from "../../../common/resources/gold.png";

import './CartItem.scss';

export type Props = {
    item: CollectionItemModel
    canCollect: boolean
    onPush: (item: CollectionItemModel) => void,
    onRemove: (tier: CollectionItemModel) => void,
}

type MonsterItemProps = {
    icon: string
    item: CollectionItemModel
    onRemove: (tier: CollectionItemModel) => void,
}

type AddItemProps = {
    item: CollectionItemModel
    onPush: (item: CollectionItemModel) => void
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
        <div>
    <div className={'AddItem'} onClick={() => {onPush(item)}}/>
        </div>

    )
}

const MonsterItem: React.FC<MonsterItemProps> = (props: MonsterItemProps) => {
    const { icon, item, onRemove } = props;
    return (
    <div>
        <div className={'CartIcon'} />
        <img src={require(`../../../common/resources/${icon}.png`).default} />
        {
            item.collectionPhase === CollectionPhase.LATEST ? <img className='RemoveButton' src={CancelImage} onClick={() => {onRemove(item)}} /> : <></>
        }
    </div>)
}

const CartItem: React.FC<Props> = (props: Props) => {
    const {item, canCollect, onPush, onRemove} = props;

    const getResource = (tier: CollectionItemTier) => {
        return getCartMonsterImageFromTier(tier);
    }

    const getComponent = (item: CollectionItemModel) => {
        if(item.collectionPhase === CollectionPhase.LOCKED) return <LockItem />
        else if(item.collectionPhase === CollectionPhase.CANDIDATE) return <AddItem item={item} onPush={canCollect ? onPush : ()=>{}} />
        else return <MonsterItem icon={getResource(item.tier)} item={item} onRemove={onRemove} />
    }

    return (
        <div className={'CartItemContainer'}>
            <div className={`CartIconContainer CollectionImageBackground`}>
                {
                    getComponent(item)
                }
            </div>
            
            <div className={'CartValueContainer'}>
            <img className={'GoldIcon'} src={GoldImage} />
              <div className={`CartValue ${canCollect ? '' : 'RedFontColor'}`} >
                  {item.value}
              </div>
            </div>

    </div>
    )
}

export default CartItem;
