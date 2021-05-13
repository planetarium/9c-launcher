import React from "react"
import { CollectionItemModel } from "../../models/collection";
import { getMonsterImageFromTier } from "../../common/utils";
import { CollectionItemTier } from "../../types"

import './Cart.scss';
import CartItem from "./CartItem/CartItem";
import CollectionButton from "../Button/Button";

export type Props = {
    cartList: CollectionItemModel[],
    totalGold: number,
    onCancel: () => void,
    onPush: (item: CollectionItemModel) => void,
    onRemove: (tier: CollectionItemModel) => void,
    onSubmit: () => void,
}

const Cart: React.FC<Props> = (props: Props) => {
    const { cartList, totalGold, onPush, onRemove, onCancel, onSubmit } = props;
    // TODO: change to useMemo
    const getResource = (tier: CollectionItemTier) => {
        return getMonsterImageFromTier(tier);
    }

    const getNeedGoldAmount = (item: CollectionItemModel) => {
      let value = 0;
      cartList.forEach(x => {
        if(x.tier <= item.tier) value += x.value;
      });
      return value;
    }
    return <div className={'CartContainer'}>
        <div className={'OpsButtonContainer'}>
        <CollectionButton
        width={164}
        height={45}
        onClick={onCancel}
      >
        Cancel
      </CollectionButton>
      <CollectionButton
        primary={true}
        width={164}
        height={45}
        onClick={onSubmit}
      >
        Apply
      </CollectionButton>
        </div>
        <div className={'CartItemListBackground'}>
        <div className={'CartItemListContainer'}>
        {
            cartList.map((x, i) => <CartItem canCollect={totalGold >= getNeedGoldAmount(x)} item={x} onPush={onPush} onRemove={onRemove} key={i} />)
        }
        </div>
        </div>



    </div>
}

export default Cart;
