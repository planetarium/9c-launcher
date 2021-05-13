import { Dialog } from "@material-ui/core"
import React, { useEffect } from "react"
import useStores from "../../../hooks/useStores";
import { useGetAvatarAddressQuery } from "../../../generated/graphql";
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

  const {data, refetch} = useGetAvatarAddressQuery({variables: {
    address: accountStore.selectedAddress,
  }});

  useEffect(() => {
    if(data?.stateQuery.agent?.avatarStates) return;
    setInterval(async () => {
      const result = await refetch();
      if(result.data.stateQuery.agent?.avatarStates) clearInterval();
    }, 2000)
  }, [])

  return (
  <Dialog
    disableBackdropClick
    disableEscapeKeyDown
    aria-labelledby="confirmation-dialog-title" open={open}>
      {
        data?.stateQuery.agent?.avatarStates 
        ? <ClaimCollectionRewardDialog
        rewards={rewards}
        avatar={data!.stateQuery.agent!.avatarStates!.map(x => {return {address: x.address, name: x.name}})}
        onActionTxId={onActionTxId}/>
        : <div>You need create avatar first</div>
      }

  </Dialog>)
}

export default ClaimCollectionRewardContainer
