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
    return <div className={'StakingItemContainer'} >
        <div>
            { item.stakingPhase === StakingPhase.CANDIDATE ?? <CircleAddIcon className={'AddIcon'} /> }
        <img className={`TIER${Number(item.tier) + 1} ${item.stakingPhase === StakingPhase.LOCKED ?? 'Outline'}`}
            src={require(`../../common/resources/${monsterResources}.png`).default} />
        </div>
    </div>
}

export default StakingItem;
