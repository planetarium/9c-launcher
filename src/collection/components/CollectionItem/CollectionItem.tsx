import React, { useState } from "react";
import { CollectionItemModel } from "../../models/collection";
import { CollectionPhase } from "../../types";
import {getMonsterImageFromTier} from '../../common/utils';
import CircleAddIcon from "../common/icon/CircleAddIcon";
import ArrowIcon from "../../common/resources/ui-staking-arrow.png";

import './CollectionItem.scss';
import { useInterval } from "../../../hooks/useInterval";

export type Props = {
    item: CollectionItemModel;
}

const CollectionItem: React.FC<Props> = (props: Props) => {
    
    const { item } = props;
    const monsterResources = getMonsterImageFromTier(item.tier);
    return <div className={`CollectionItemContainer TIER${Number(item.tier)}`} >
        <div>
          <img src={ArrowIcon} className={`arrow ${item.collectionPhase === CollectionPhase.CANDIDATE ? 'visible' : 'hide'}`} />
        <img className={`${item.collectionPhase >= CollectionPhase.CANDIDATE && 'Outline'}`}
            src={require(`../../common/resources/${monsterResources}.png`).default} />
        </div>
    </div>
}

export default CollectionItem;
