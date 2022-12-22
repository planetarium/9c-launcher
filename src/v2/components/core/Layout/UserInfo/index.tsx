import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import {
  TxStatus,
  useClaimStakeRewardLazyQuery,
  useTransactionResultLazyQuery,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { useIsPreloadDone } from "src/v2/utils/usePreload";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LaunchIcon from "@material-ui/icons/Launch";
import FileCopyIcon from "@material-ui/icons/FileCopy";

import goldIconUrl from "src/v2/resources/ui-main-icon-gold.png";
import monsterIconUrl from "src/v2/resources/monster.png";
import { getRemain } from "src/v2/utils/monsterCollection/utils";
import ClaimCollectionRewardsOverlay from "src/v2/views/ClaimCollectionRewardsOverlay";
import { ClaimButton } from "./ClaimButton";
import { clipboard } from "electron";
import { toast } from "react-hot-toast";
import { useT } from "@transifex/react";
import { useBalance } from "src/v2/utils/useBalance";
import MonsterCollectionOverlay from "src/v2/views/MonsterCollectionOverlay";
import { useStaking } from "src/v2/utils/staking";
import { useTx } from "src/v2/utils/useTx";
import { trackEvent } from "src/v2/utils/mixpanel";

const UserInfoStyled = styled(motion.ul, {
  position: "fixed",
  top: 30,
  left: 50,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: 0,
  margin: 0,
  dragable: false,
});

const UserInfoItem = styled(motion.li, {
  display: "flex",
  height: 27,
  alignItems: "center",
  padding: 5,
  borderRadius: 5,
  "& > * + *": {
    marginLeft: 5,
  },
  "&:hover": {
    backgroundColor: "$gray80",
  },
});

export default function UserInfo() {
  const account = useStore("account");
  const isDone = useIsPreloadDone();
  const {
    canClaim,
    tip,
    startedBlockIndex,
    receivedBlockIndex,
    claimableBlockIndex,
    deposit,
    refetch,
  } = useStaking();
  const [fetchResult, { data: result, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
    });

  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  useEffect(() => {
    const txStatus = result?.transaction.transactionResult.txStatus;
    if (!txStatus || txStatus === TxStatus.Staging) return;
    stopPolling?.();
    setClaimLoading(false);

    if (txStatus === TxStatus.Success) refetch();
    else console.error("Claim transaction failed: ", result);
  }, [result]);

  const isCollecting = !!startedBlockIndex && startedBlockIndex > 0;
  const remainingText = useMemo(() => {
    if (!claimableBlockIndex) return 0;
    const minutes = Math.round((claimableBlockIndex - tip) / 5);
    return getRemain(minutes);
  }, [claimableBlockIndex, tip]);

  const [claimStakeReward, { data, loading, error }] =
    useClaimStakeRewardLazyQuery();
  const tx = useTx();

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const gold = useBalance();

  const copyAddress = useCallback(() => {
    clipboard.writeText(account.address);
    toast("Copied!");
  }, [account.address]);

  const t = useT();

  const [isCollectionOpen, setCollectionOpen] = useState<boolean>(false);

  if (!isDone || !account.isLogin) return null;

  return (
    <UserInfoStyled>
      <UserInfoItem onClick={copyAddress}>
        <AccountBoxIcon />
        <strong>{account.address}</strong>
        <FileCopyIcon />
      </UserInfoItem>
      <UserInfoItem>
        <img src={goldIconUrl} alt="gold" />
        <strong>{Number(gold)}</strong>
      </UserInfoItem>
      <UserInfoItem onClick={() => setCollectionOpen(true)}>
        <img src={monsterIconUrl} width={28} alt="monster collection icon" />
        <strong>{deposit?.replace(/\.0+$/, "") || "0"}</strong>
        {isCollecting ? ` (Remaining ${remainingText})` : " (-)"}
        <LaunchIcon />
        {canClaim && (
          <ClaimButton
            loading={claimLoading}
            onClick={() => setOpenDialog(true)}
          />
        )}
        <ClaimCollectionRewardsOverlay
          isOpen={openDialog}
          onClose={() => setOpenDialog(false)}
          tip={tip}
          onConfirm={(avatar) => {
            account
              .getPublicKeyString()
              .then((v) =>
                claimStakeReward({
                  variables: {
                    publicKey: v,
                    avatarAddress: avatar.address.replace(/^0x/, ""),
                  },
                })
              )
              .then(() => tx(data?.actionTxQuery.claimStakeReward))
              .then((txId) => {
                if (!txId.data) return;
                fetchResult({
                  variables: { txId: txId.data.stageTransaction },
                });
                trackEvent("Staking/Claim", {
                  txId,
                  avatar: avatar.address,
                });
                toast.success(
                  t("Successfully sent rewards to {name} #{address}", {
                    _tags: "v2/monster-collection",
                    name: avatar.name,
                    address: avatar.address.slice(2, 6),
                  })
                );
                setClaimLoading(true);
              })
              .catch((e) => console.error(e));
            setOpenDialog(false);
          }}
        />
      </UserInfoItem>
      <MonsterCollectionOverlay
        isOpen={isCollectionOpen}
        onClose={() => setCollectionOpen(false)}
      />
    </UserInfoStyled>
  );
}
