import React from "react"
import { StakingItemModel } from "../../models/staking";
import { getMonsterImageFromTier } from "../../common/utils";
import { StakingItemTier } from "../../types"

import './Cart.scss';
import CartItem from "./CartItem/CartItem";
import { Button } from "@material-ui/core";

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
        <Button
        variant="contained"
        style={{
          width: 164,
          height: 45,
          fontSize: 24
        }}
        onClick={(e) => {e.preventDefault(); onCancel();}}
      >
        Cancel
      </Button>
      <Button
        color="primary"
        variant="contained"
        style={{
          width: 164,
          height: 45,
          fontSize: 24
        }}
        onClick={(e) => {e.preventDefault(); onSubmit();}}
      >
        Apply
      </Button>
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
