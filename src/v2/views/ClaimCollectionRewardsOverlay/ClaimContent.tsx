import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { GetAvatarAddressQuery } from "src/v2/generated/graphql";
import { useTx } from "src/v2/utils/useTx";

import type { ClaimCollectionRewardsData } from ".";
import H1 from "src/v2/components/ui/H1";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import Button from "src/v2/components/ui/Button";

interface ClaimContentProps extends ClaimCollectionRewardsData {
  data: GetAvatarAddressQuery;
}

function ClaimContent({ data, onActionTxId, rewards, tip }: ClaimContentProps) {
  const avatars = useMemo(
    () =>
      data.stateQuery.agent?.avatarStates?.map((x) => ({
        address: x.address,
        name: x.name,
        updatedAt: x.updatedAt,
      })),
    [data]
  );

  const [avatarIndex, setAvatarIndex] = useState(0);
  const currentAvatar = avatars?.[avatarIndex];
  const hasMultipleAvatars = !avatars || avatars.length !== 1;

  const tx = useTx(
    "claim-monster-collection-reward",
    currentAvatar?.address.replace("0x", "")
  );

  useEffect(() => {
    if (hasMultipleAvatars) return;
    tx().then((v) => v.data != null && onActionTxId(v.data.stageTxV2));
  }, [avatars]);

  if (!hasMultipleAvatars) return null;

  return (
    <>
      <Select
        value={String(avatarIndex)}
        onChange={(v) => setAvatarIndex(Number(v))}
      >
        {avatars?.map((avatar, i) => (
          <SelectOption key={avatar.address} value={String(i)}></SelectOption>
        ))}
      </Select>
      <Button
        onClick={() =>
          tx().then((v) => v.data != null && onActionTxId(v.data.stageTxV2))
        }
      >
        OK
      </Button>
    </>
  );
}

export default observer(ClaimContent);
