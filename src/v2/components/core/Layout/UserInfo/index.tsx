import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import {
  useBalanceByAgentSubscription,
  useGetNcgBalanceQuery,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { useIsPreloadDone } from "src/v2/utils/usePreload";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LaunchIcon from "@material-ui/icons/Launch";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import {
  openMonsterCollection,
  useMonsterCollection,
} from "src/v2/utils/monsterCollection";

import goldIconUrl from "src/v2/resources/ui-main-icon-gold.png";
import monsterIconUrl from "src/v2/resources/monster.png";
import { getRemain } from "src/collection/common/utils";
import ClaimCollectionRewardsOverlay from "src/v2/views/ClaimCollectionRewardsOverlay";
import { ClaimButton } from "./ClaimButton";
import { Reward } from "src/collection/types";
import { clipboard } from "electron";

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
    currentReward,
    receivedBlockIndex,
    claimableBlockIndex,
    currentTip,
    depositedGold,
    level,
  } = useMonsterCollection();

  const isCollecting = level > 0;
  const canClaim = currentReward.size > 0;
  const remainingText = useMemo(() => {
    if (!claimableBlockIndex) return 0;
    const minutes = Math.round((claimableBlockIndex - currentTip) / 5);
    return getRemain(minutes);
  }, [claimableBlockIndex, currentTip]);
  const rewards = useMemo<Reward[]>(
    () =>
      Array.from(currentReward).map((x) => ({ itemId: x[0], quantity: x[1] })),
    [currentReward]
  );

  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  useEffect(() => setClaimLoading(false), [receivedBlockIndex]);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { data: ncgBalanceQuery } = useGetNcgBalanceQuery({
    variables: {
      address: account.selectedAddress,
    },
    skip: !account.isLogin,
  });
  const { data: balance } = useBalanceByAgentSubscription({
    variables: {
      address: account.selectedAddress,
    },
    skip: !account.isLogin,
  });

  const gold = useMemo(
    () => Number(balance?.balanceByAgent ?? ncgBalanceQuery?.goldBalance) ?? 0,
    [balance, ncgBalanceQuery]
  );

  if (!isDone || !account.isLogin) return null;

  return (
    <UserInfoStyled>
      <UserInfoItem
        onClick={() => clipboard.writeText(account.selectedAddress)}
      >
        <AccountBoxIcon />
        <strong>{account.selectedAddress}</strong>
        <FileCopyIcon />
      </UserInfoItem>
      <UserInfoItem>
        <img src={goldIconUrl} alt="gold" />
        <strong>{Number(gold)}</strong>
      </UserInfoItem>
      <UserInfoItem
        onClick={() => openMonsterCollection(account.selectedAddress)}
      >
        <img src={monsterIconUrl} width={28} alt="monster collection icon" />
        <strong>{depositedGold || "0"}</strong>
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
          tip={currentTip}
          rewards={rewards}
          onActionTxId={(_) =>
            void (setOpenDialog(false), setClaimLoading(true))
          }
        />
      </UserInfoItem>
    </UserInfoStyled>
  );
}
