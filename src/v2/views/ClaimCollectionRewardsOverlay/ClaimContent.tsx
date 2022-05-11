import React, { useEffect, useMemo, useReducer, useState } from "react";
import { observer } from "mobx-react";
import { GetAvatarAddressQuery } from "src/v2/generated/graphql";
import { useTx } from "src/v2/utils/useTx";

import type { ClaimCollectionRewardsOverlayProps } from ".";
import { RadioItem, RadioGroup } from "src/v2/components/ui/RadioGroup";
import Button, { ButtonBar } from "src/v2/components/ui/Button";
import { T } from "src/renderer/i18n";
import { styled } from "src/v2/stitches.config";
import { getRemain } from "src/collection/common/utils";
import OverlayBase from "src/v2/components/core/OverlayBase";

interface ClaimContentProps extends ClaimCollectionRewardsOverlayProps {
  data: GetAvatarAddressQuery;
}

const transifexTags = "v2/views/ClaimCollectionRewardsOverlay";

const Title = styled("h2", {
  textAlign: "center",
});

const ClaimCollectionRewardsOverlayBase = styled(OverlayBase, {
  "&&": {
    width: 570,
    height: 460,
    margin: "20vh auto",
  },
  display: "flex",
  flexDirection: "column",
  "& > * + *": {
    marginTop: 16,
  },
});

const LastActivity = styled("span", {
  opacity: ".8",
  display: "inline-block",
});

export interface Avatar {
  address: string;
  name: string;
  updatedAt: number;
}

function ClaimContent({
  data,
  onActionTxId,
  rewards,
  tip,
  onClose,
  isOpen,
}: ClaimContentProps) {
  const avatars = useMemo<Avatar[] | undefined>(
    () =>
      data.stateQuery.agent?.avatarStates?.map((x) => ({
        address: x.address,
        name: x.name,
        updatedAt: x.updatedAt,
      })),
    [data]
  );

  const [currentAvatarIndex, setCurrentAvatarIndex] = useReducer(
    (_: number, action: string) => Number(action),
    0
  );
  const currentAvatar = useMemo(() => avatars?.[currentAvatarIndex], [
    avatars,
    currentAvatarIndex,
  ]);
  const hasMultipleAvatars = !avatars || avatars.length !== 1;

  const tx = useTx(
    "claim-monster-collection-reward",
    currentAvatar?.address.replace("0x", "")
  );

  useEffect(() => {
    if (hasMultipleAvatars || !isOpen) return;
    tx().then(
      (v) => v.data != null && onActionTxId(v.data.stageTxV2, currentAvatar)
    );
  }, [avatars, isOpen]);

  if (!hasMultipleAvatars) return null;

  return (
    <ClaimCollectionRewardsOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <Title>
        <T
          _str="Choose a character to receive rewards."
          _tags={transifexTags}
        />
      </Title>
      <RadioGroup
        value={String(currentAvatarIndex)}
        onValueChange={setCurrentAvatarIndex}
      >
        {avatars?.map((avatar, i) => (
          <RadioItem key={avatar.address} value={String(i)}>
            {/* Ensures the display: block, which makes <br> work */}
            <div>
              {avatar.name} #{avatar.address.substring(2, 6)}
              <br />
              <LastActivity>
                <T
                  _str="Last login at: {remain}"
                  _tags={transifexTags}
                  remain={getRemain(tip - avatar.updatedAt)}
                />
              </LastActivity>
            </div>
          </RadioItem>
        ))}
      </RadioGroup>
      <ButtonBar placement="bottom">
        <Button onClick={() => onActionTxId(null)}>
          <T _str="Cancel" _tags={transifexTags} />
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            tx().then(
              (v) =>
                v.data != null && onActionTxId(v.data.stageTxV2, currentAvatar)
            )
          }
        >
          <T _str="Send" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </ClaimCollectionRewardsOverlayBase>
  );
}

export default observer(ClaimContent);
