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
import ClaimContent from "./ClaimContent";

export interface ClaimCollectionRewardsData {
  rewards: Reward[];
  tip: number;
  onActionTxId: (txId: string | null) => void;
}

interface ClaimCollectionRewardsOverlayProps
  extends OverlayProps,
    ClaimCollectionRewardsData {}

const transifexTags = "v2/views/ClaimCollectionRewardsOverlay";

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

function ClaimCollectionRewardsOverlay({
  isOpen,
  onClose,
  ...collectionData
}: ClaimCollectionRewardsOverlayProps) {
  const { account } = useStore();
  const { loading, data } = useGetAvatarAddressQuery({
    variables: {
      address: account.selectedAddress,
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
    <ClaimCollectionRewardsOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <ClaimContent {...collectionData} data={data} />
    </ClaimCollectionRewardsOverlayBase>
  );
}

export default observer(ClaimCollectionRewardsOverlay);
