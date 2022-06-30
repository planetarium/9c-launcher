import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { observer } from "mobx-react";
import { GetAvatarAddressQuery } from "src/v2/generated/graphql";
import { useTx } from "src/v2/utils/useTx";

import type { ClaimCollectionRewardsOverlayProps } from ".";
import { RadioItem, RadioGroup } from "src/v2/components/ui/RadioGroup";
import { T } from "src/renderer/i18n/react";
import { styled } from "src/v2/stitches.config";
import { getRemain } from "src/collection/common/utils";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import {
  AlertButton,
  AlertDescription,
} from "../MonsterCollectionOverlay/dialog";

import claimBg from "src/v2/resources/collection/popup-account-selection.png";

interface ClaimContentProps extends ClaimCollectionRewardsOverlayProps {
  data: GetAvatarAddressQuery;
}

const transifexTags = "v2/views/ClaimCollectionRewardsOverlay";

const ClaimCollectionRewardsOverlayBase = styled(AlertDialog, {
  "&&": {
    width: 728,
    height: 493,
    backgroundImage: `url(${claimBg})`,
    backgroundColor: "transparent",
  },
  "& > * + *": {
    marginTop: 16,
  },
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  dragable: false,
});

const ButtonBar = styled("div", {
  alignSelf: "center",
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
  onConfirm,
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

  useEffect(() => {
    if (hasMultipleAvatars || !isOpen || !currentAvatar) return;
    onConfirm(currentAvatar);
  }, [avatars, isOpen]);

  const leastDestructiveRef = useRef<HTMLButtonElement>(null);

  if (!hasMultipleAvatars) return null;

  return (
    <ClaimCollectionRewardsOverlayBase
      leastDestructiveRef={leastDestructiveRef}
      isOpen={isOpen}
      onDismiss={onClose}
    >
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
      <AlertDescription as={AlertDialogLabel}>
        Please select an account to send staking rewards to.
      </AlertDescription>
      <ButtonBar>
        <AlertButton ref={leastDestructiveRef} onClick={onClose}>
          <T _str="Cancel" _tags={transifexTags} />
        </AlertButton>
        <AlertButton
          variant="primary"
          disabled={!currentAvatar}
          onClick={() => currentAvatar && onConfirm(currentAvatar)}
        >
          <T _str="Send" _tags={transifexTags} />
        </AlertButton>
      </ButtonBar>
    </ClaimCollectionRewardsOverlayBase>
  );
}

export default observer(ClaimContent);
