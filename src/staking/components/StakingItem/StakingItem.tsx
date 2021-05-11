import React from "react";
import { StakingItemModel } from "../../models/staking";
import { StakingPhase } from "../../types";
import {getMonsterImageFromTier} from '../../common/utils';
import CircleAddIcon from "../common/icon/CircleAddIcon";

export type Props = {
    item: StakingItemModel;
}

const StakingItem: React.FC<Props> = (props: Props) => {
    const { item } = props;
    const monsterResources = getMonsterImageFromTier(item.tier);
    console.log(JSON.stringify(item))
    return <div className={'StakingItemContainer'} >
        <div>
            { item.stakingPhase === StakingPhase.CANDIDATE ?? <CircleAddIcon className={'AddIcon'} /> }
        <img className={`TIER${Number(item.tier)} ${item.stakingPhase >= StakingPhase.CANDIDATE && 'Outline'}`}
            src={require(`../../common/resources/${monsterResources}.png`).default} />
        </div>
    </div>
}

export default StakingItem;
