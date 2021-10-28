import { Dialog } from "@material-ui/core";
import React, { useEffect } from "react";
import useStores from "../../../hooks/useStores";
import {
  GetAvatarAddressQuery,
  useGetAvatarAddressQuery,
  useGetTipQuery,
} from "../../../generated/graphql";
import { Reward, RewardCategory } from "../../../collection/types";
import ClaimCollectionRewardDialog from "./ClaimCollectionRewardDialog";

type Props = {
  open: boolean;
  rewards: Reward[];
  avatarAddressQuery: GetAvatarAddressQuery;
  tip: number;
  onActionTxId: (txId: string) => void;
  agentAddress: string;
};

const ClaimCollectionRewardContainer: React.FC<Props> = (props: Props) => {
  const {
    open,
    rewards,
    onActionTxId,
    avatarAddressQuery: data,
    tip,
    agentAddress,
  } = props;

  console.log(
    `avatarInfo: ${JSON.stringify(data?.stateQuery.agent?.avatarStates)}`
  );

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="confirmation-dialog-title"
      open={open}
    >
      {data?.stateQuery.agent?.avatarStates ? (
        <ClaimCollectionRewardDialog
          tip={tip}
          rewards={rewards}
          avatar={data!.stateQuery.agent!.avatarStates!.map((x) => {
            return { address: x.address, name: x.name, updatedAt: x.updatedAt };
          })}
          onActionTxId={onActionTxId}
          agentAddress={agentAddress}
        />
      ) : (
        <div>You need create avatar first</div>
      )}
    </Dialog>
  );
};

export default ClaimCollectionRewardContainer;
