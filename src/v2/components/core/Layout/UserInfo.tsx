import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import {
  useBalanceByAgentSubscription,
  useGetNcgBalanceQuery,
  useStateQueryMonsterCollectionQuery,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { useIsPreloadDone } from "src/v2/utils/usePreload";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import goldIconUrl from "src/v2/resources/ui-main-icon-gold.png";

const UserInfoStyled = styled(motion.ul, {
  position: "fixed",
  top: 30,
  left: 50,
  display: "flex",
  flexDirection: "column",
  padding: 0,
  margin: 0,
});

const UserInfoItem = styled(motion.li, {
  display: "flex",
  height: 27,
  alignItems: "center",
  "& > svg, & > img": {
    marginRight: 5,
  },
});

export default function UserInfo() {
  const account = useStore("account");
  const isDone = useIsPreloadDone();

  const { data: collectionStateQuery } = useStateQueryMonsterCollectionQuery({
    variables: {
      agentAddress: account.selectedAddress,
    },
  });
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
    </UserInfoStyled>
  );
}
