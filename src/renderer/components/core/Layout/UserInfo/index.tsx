import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { styled } from "src/renderer/stitches.config";
import {
  TxStatus,
  useLatestStakingSheetQuery,
  useClaimStakeRewardLazyQuery,
  useTransactionResultLazyQuery,
} from "src/generated/graphql";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LaunchIcon from "@material-ui/icons/Launch";
import FileCopyIcon from "@material-ui/icons/FileCopy";

import goldIconUrl from "src/renderer/resources/ui-main-icon-gold.png";
import monsterIconUrl from "src/renderer/resources/monster.png";
import { getRemain } from "src/utils/monsterCollection/utils";
import ClaimCollectionRewardsOverlay from "src/renderer/views/ClaimCollectionRewardsOverlay";
import { Button, ClaimButton } from "./ClaimButton";
import { clipboard } from "electron";
import { toast } from "react-hot-toast";
import { useT } from "@transifex/react";
import { useBalance } from "src/utils/useBalance";
import MonsterCollectionOverlay from "src/renderer/views/MonsterCollectionOverlay";
import { useUserStaking } from "src/utils/staking";
import { useTx } from "src/utils/useTx";
import { trackEvent } from "src/utils/mixpanel";
import { useLoginSession } from "src/utils/useLoginSession";
import { Avatar } from "src/renderer/views/ClaimCollectionRewardsOverlay/ClaimContent";
import { ExportOverlay } from "./ExportOverlay";
import deepEqual from "deep-equal";
import { StakeStatusButton } from "./StakeStatus";

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
  const loginSession = useLoginSession();
  const { data: latestSheet } = useLatestStakingSheetQuery();
  const {
    canClaim,
    tip,
    startedBlockIndex,
    receivedBlockIndex,
    cancellableBlockIndex,
    claimableBlockIndex,
    deposit,
    stakeRewards,
    refetch,
  } = useUserStaking();
  const [fetchResult, { data: result, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    });
  const isCollecting = !!startedBlockIndex && startedBlockIndex > 0;
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [isMigratable, setIsMigratable] = useState<boolean>(
    isCollecting &&
      !deepEqual(stakeRewards, latestSheet?.stateQuery.latestStakeRewards, {
        strict: true,
      }),
  );
  useEffect(() => {
    const txStatus = result?.transaction.transactionResult.txStatus;
    if (!txStatus || txStatus === TxStatus.Staging) return;
    stopPolling?.();
    setClaimLoading(false);

    if (txStatus === TxStatus.Success) {
      toast.success(
        t("Successfully sent rewards to {name} #{address}", {
          _tags: "v2/monster-collection",
          name: claimedAvatar.current!.name,
          address: claimedAvatar.current!.address.slice(2),
        }),
      );
      refetch();
    } else {
      toast.error(t("Failed to claim your reward."));
      console.error("Claim transaction failed: ", result);
    }
  }, [result]);

  const remainingText = useMemo(() => {
    if (!claimableBlockIndex) return 0;
    const minutes = Math.round((claimableBlockIndex - tip) / 5);
    return `${getRemain(minutes)} (${claimableBlockIndex - tip} Blocks)`;
  }, [claimableBlockIndex, tip]);

  const claimedAvatar = useRef<Avatar>();

  const [requestClaimStakeRewardTx] = useClaimStakeRewardLazyQuery({
    fetchPolicy: "network-only",
    onCompleted: ({ actionTxQuery: { claimStakeReward } }) => {
      const avatar = claimedAvatar.current!;
      tx(claimStakeReward).then((txId) => {
        if (txId!.data)
          fetchResult({
            variables: { txId: txId!.data.stageTransaction },
          });
        trackEvent("Staking/Claim", {
          txId,
          avatar: avatar.address,
        });
        setClaimLoading(true);
      });
    },
  });
  const tx = useTx();

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const gold = useBalance();

  const copyAddress = useCallback(() => {
    if (loginSession) {
      clipboard.writeText(loginSession.address.toString());
      toast("Copied!");
    }
  }, [loginSession]);

  const stakingStastics = useCallback(() => {
    if (isCollecting) {
      clipboard.writeText(`
      Tip: ${tip}
      Staking Status: ${
        isCollecting
          ? isMigratable
            ? canClaim
              ? "Claimable"
              : "Migratable"
            : "Staked"
          : "Not Staking"
      }
      isLocked : ${
        cancellableBlockIndex !== undefined && tip >= cancellableBlockIndex!
          ? "true"
          : "false"
      }
      {
      "stakeState": {
        "deposit": "${deposit}",
        "startedBlockIndex": ${startedBlockIndex},
        "receivedBlockIndex": ${receivedBlockIndex},
        "cancellableBlockIndex": ${cancellableBlockIndex},
        "claimableBlockIndex": ${claimableBlockIndex},
      }
    }
    `);
      toast("Staking Status Copied!");
    }
  }, [isCollecting]);

  const t = useT();

  const [isCollectionOpen, setCollectionOpen] = useState<boolean>(false);
  const [isExportKeyOpen, setExportKeyOpen] = useState<boolean>(false);

  if (!loginSession) return null;

  return (
    <UserInfoStyled>
      <UserInfoItem
        onClick={() => {
          copyAddress();
          setExportKeyOpen(true);
        }}
      >
        <AccountBoxIcon />
        <strong>{loginSession.address.toString()}</strong>
        <FileCopyIcon />
      </UserInfoItem>
      <UserInfoItem>
        <img src={goldIconUrl} alt="gold" />
        <strong>{Number(gold)}</strong>
      </UserInfoItem>
      <UserInfoItem onClick={() => setCollectionOpen(true)}>
        <img src={monsterIconUrl} width={28} alt="monster collection icon" />
        <strong>{deposit?.replace(/\.0+$/, "") || "0"}</strong>
        {isCollecting && !canClaim ? ` - Remaining: ${remainingText}` : " (-)"}
        <LaunchIcon />
        {canClaim && (
          <ClaimButton
            loading={claimLoading}
            onClick={() => setOpenDialog(true)}
          />
        )}
        {!canClaim && isMigratable && <Button>Migrate Stake</Button>}
        {isCollecting && (
          <StakeStatusButton onClick={() => stakingStastics()} />
        )}
        <ClaimCollectionRewardsOverlay
          isOpen={openDialog}
          onClose={() => setOpenDialog(false)}
          tip={tip}
          onConfirm={(avatar) => {
            if (loginSession.publicKey) {
              claimedAvatar.current = avatar;
              requestClaimStakeRewardTx({
                variables: {
                  publicKey: loginSession.publicKey.toHex("uncompressed"),
                  avatarAddress: avatar.address.replace(/^0x/, ""),
                },
              });
            }

            setOpenDialog(false);
          }}
        />
      </UserInfoItem>
      <MonsterCollectionOverlay
        isOpen={isCollectionOpen}
        onClose={() => setCollectionOpen(false)}
      />
      <ExportOverlay
        isOpen={isExportKeyOpen}
        onClose={() => setExportKeyOpen(false)}
      />
    </UserInfoStyled>
  );
}
