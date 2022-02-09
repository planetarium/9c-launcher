import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import {
  useBalanceByAgentSubscription,
  useGetNcgBalanceQuery,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { useIsPreloadDone } from "src/v2/utils/usePreload";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { useMonsterCollection } from "src/v2/utils/monsterCollection";

import goldIconUrl from "src/v2/resources/ui-main-icon-gold.png";
import monsterIconUrl from "src/v2/resources/monster.png";

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
  "& > svg, & > img": {
    marginRight: 5,
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
    depositedGold,
    level,
  } = useMonsterCollection();

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
      <UserInfoItem>
        <AccountBoxIcon />
        {account.selectedAddress}
      </UserInfoItem>
      <UserInfoItem>
        <img src={goldIconUrl} alt="gold" />
        {Number(gold)}
      </UserInfoItem>
      <UserInfoItem>
        <img src={monsterIconUrl} width={28} alt="monster collection icon" />
        {depositedGold || "0"}
      </UserInfoItem>
    </UserInfoStyled>
  );
}
