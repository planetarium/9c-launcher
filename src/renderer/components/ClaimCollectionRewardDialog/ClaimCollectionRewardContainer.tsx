import { Dialog } from "@material-ui/core"
import React, { useEffect } from "react"
import useStores from "../../../hooks/useStores";
import { useGetAvatarAddressQuery, useGetTipQuery } from "../../../generated/graphql";
import { Reward, RewardCategory } from "../../../collection/types";
import ClaimCollectionRewardDialog from "./ClaimCollectionRewardDialog";


type Props = {
  open: boolean;
  rewards: Reward[];
  onActionTxId: (txId: string) => void;
}

const ClaimCollectionRewardContainer: React.FC<Props> = (props: Props) => {
  const {open, rewards, onActionTxId} = props;
  const {accountStore} = useStores();

  const {data, refetch, stopPolling} = useGetAvatarAddressQuery({variables: {
    address: accountStore.selectedAddress,
  }, pollInterval: 2000});
  
  const {data: nodeStatus} = useGetTipQuery({
    pollInterval: 1000 * 5
  });

  console.log(`avatarInfo: ${JSON.stringify(data?.stateQuery.agent?.avatarStates)}`)

  return (
  <Dialog
    disableBackdropClick
    disableEscapeKeyDown
    aria-labelledby="confirmation-dialog-title" open={open}>
      {
        data?.stateQuery.agent?.avatarStates 
        ? <ClaimCollectionRewardDialog
        tip={nodeStatus?.nodeStatus.tip.index!}
        rewards={rewards}
        avatar={data!.stateQuery.agent!.avatarStates!.map(x => {return {address: x.address, name: x.name, updatedAt: x.updatedAt}})}
        onActionTxId={onActionTxId}/>
        : <div>You need create avatar first</div>
      }

  </Dialog>)
}

export default ClaimCollectionRewardContainer
