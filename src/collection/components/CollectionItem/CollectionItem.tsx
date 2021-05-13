import React from "react";
import { CollectionItemModel } from "../../models/collection";
import { CollectionPhase } from "../../types";
import {getMonsterImageFromTier} from '../../common/utils';
import CircleAddIcon from "../common/icon/CircleAddIcon";

import './CollectionItem.scss';

export type Props = {
    item: CollectionItemModel;
}

const CollectionItem: React.FC<Props> = (props: Props) => {
    const { item } = props;
    const monsterResources = getMonsterImageFromTier(item.tier);
    return <div className={'CollectionItemContainer'} >
        <div>
            { item.collectionPhase === CollectionPhase.CANDIDATE ?? <CircleAddIcon className={'AddIcon'} /> }
        <img className={`TIER${Number(item.tier)} ${item.collectionPhase >= CollectionPhase.CANDIDATE && 'Outline'}`}
            src={require(`../../common/resources/${monsterResources}.png`).default} />
        </div>
    </div>
}

export default CollectionItem;
