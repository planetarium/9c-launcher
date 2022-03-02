import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { GetAvatarAddressQuery } from "src/v2/generated/graphql";
import { useTx } from "src/v2/utils/useTx";

import type { ClaimCollectionRewardsData } from ".";
import H1 from "src/v2/components/ui/H1";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import Button, { ButtonBar } from "src/v2/components/ui/Button";
import { T } from "src/renderer/i18n";
import { styled } from "src/v2/stitches.config";
import { getRemain } from "src/collection/common/utils";

interface ClaimContentProps extends ClaimCollectionRewardsData {
  data: GetAvatarAddressQuery;
}

const transifexTags = "v2/views/ClaimCollectionRewardsOverlay";

const Title = styled("h2", {
  textAlign: "center",
});

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
      <Title>
        <T
          _str="Choose a character to receive rewards."
          _tags={transifexTags}
        />
      </Title>
      <Select
        value={String(avatarIndex)}
        onChange={(v) => setAvatarIndex(Number(v))}
      >
        {avatars?.map((avatar, i) => (
          <SelectOption key={avatar.address} value={String(i)}>
            {avatar.name}
            {getRemain}
          </SelectOption>
        ))}
      </Select>
      <ButtonBar placement="bottom">
        <Button onClick={() => onActionTxId(null)}>
          <T _str="Cancel" _tags={transifexTags} />
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            tx().then((v) => v.data != null && onActionTxId(v.data.stageTxV2))
          }
        >
          <T _str="Send" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </>
  );
}

export default observer(ClaimContent);
