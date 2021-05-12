import React from "react"
import { StakingItemModel } from "../../models/staking";
import { getMonsterImageFromTier } from "../../common/utils";
import { StakingItemTier } from "../../types"

import './Cart.scss';
import CartItem from "./CartItem/CartItem";
import StakingButton from "../Button/Button";

export type Props = {
    cartList: StakingItemModel[],
    totalGold: number,
    onCancel: () => void,
    onPush: (item: StakingItemModel) => void,
    onRemove: (tier: StakingItemModel) => void,
    onSubmit: () => void,
}

const Cart: React.FC<Props> = (props: Props) => {
    const { cartList, totalGold, onPush, onRemove, onCancel, onSubmit } = props;
    // TODO: change to useMemo
    const getResource = (tier: StakingItemTier) => {
        return getMonsterImageFromTier(tier);
    }

    const getNeedGoldAmount = (item: StakingItemModel) => {
      let value = 0;
      cartList.forEach(x => {
        if(x.tier <= item.tier) value += x.value;
      });
      return value;
    }
    return <div className={'CartContainer'}>
        <div className={'OpsButtonContainer'}>
        <StakingButton
        width={164}
        height={45}
        onClick={onCancel}
      >
        Cancel
      </StakingButton>
      <StakingButton
        primary={true}
        width={164}
        height={45}
        onClick={onSubmit}
      >
        Apply
      </StakingButton>
        </div>
        <div className={'CartItemListBackground'}>
        <div className={'CartItemListContainer'}>
        {
            cartList.map((x, i) => <CartItem canStake={totalGold >= getNeedGoldAmount(x)} item={x} onPush={onPush} onRemove={onRemove} key={i} />)
        }
        </div>
        </div>



    </div>
}

export default Cart;
