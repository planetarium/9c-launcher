import { observer } from "mobx-react";
import React from "react";
import { Reward } from "src/collection/types";
import { T } from "src/renderer/i18n";
import OverlayBase from "src/v2/components/core/OverlayBase";
import H1 from "src/v2/components/ui/H1";
import { useGetAvatarAddressQuery } from "src/v2/generated/graphql";
import { styled } from "src/v2/stitches.config";
import { OverlayProps } from "src/v2/utils/types";
import { useStore } from "src/v2/utils/useStore";
import ClaimContent, { Avatar } from "./ClaimContent";

export interface ClaimCollectionRewardsOverlayProps extends OverlayProps {
  tip: number;
  onConfirm(avatar: Avatar): void;
}

const transifexTags = "v2/views/ClaimCollectionRewardsOverlay";

function ClaimCollectionRewardsOverlay({
  isOpen,
  onClose,
  ...collectionData
}: ClaimCollectionRewardsOverlayProps) {
  const { account } = useStore();
  const { loading, data } = useGetAvatarAddressQuery({
    variables: {
      address: account.address,
    },
  });

  if (loading) {
    return (
      <OverlayBase isOpen={isOpen} onDismiss={onClose}>
        <H1>
          <T _str="Loading..." _tags={transifexTags} />
        </H1>
      </OverlayBase>
    );
  }

  if (!data?.stateQuery.agent?.avatarStates) {
    return (
      <OverlayBase isOpen={isOpen} onDismiss={onClose}>
        <H1>
          <T _str="You need to create an avatar first." _tags={transifexTags} />
        </H1>
      </OverlayBase>
    );
  }

  return (
    <ClaimContent
      {...collectionData}
      data={data}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

export default observer(ClaimCollectionRewardsOverlay);
