import { Dialog } from "@material-ui/core"
import React from "react"
import useStores from "../../../hooks/useStores";
import { useGetAvatarAddressQuery } from "../../../generated/graphql";
import { Reward, RewardCategory } from "../../../staking/types";
import ClaimStakingRewardDialog from "./ClaimStakingRewardDialog";


type Props = {
  open: boolean;
  rewards: Reward[];
  onActionTxId: (txId: string) => void;
}

const ClaimStakingRewardContainer: React.FC<Props> = (props: Props) => {
  const {open, rewards, onActionTxId} = props;
  const {accountStore} = useStores();

  const {loading, error, data} = useGetAvatarAddressQuery({variables: {
    address: accountStore.selectedAddress,
  }});

  return (
  <Dialog
    disableBackdropClick
    disableEscapeKeyDown
    aria-labelledby="confirmation-dialog-title" open={open}>
      {
        data?.stateQuery.agent?.avatarStates 
        ? <ClaimStakingRewardDialog
        rewards={rewards}
        avatar={data!.stateQuery.agent!.avatarStates!.map(x => {return {address: x.address, name: x.name}})}
        onActionTxId={onActionTxId}/>
        : <div>You need create avatar first</div>
      }

  </Dialog>)
}

export default ClaimStakingRewardContainer
