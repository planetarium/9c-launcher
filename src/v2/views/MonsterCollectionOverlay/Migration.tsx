import React from "react";
import { LegacyCollectionStateQuery } from "src/v2/generated/graphql";
import { MigrationAlert, MigrationAlertItem } from "./dialog";
import ncgIcon from "src/v2/resources/collection/items/ncg.png";

interface MigrationProps {
  tip: number;
  collectionState: NonNullable<
    LegacyCollectionStateQuery["stateQuery"]["monsterCollectionState"]
  >;
  onConfirm(): void;
}

export default function Migration({
  tip,
  collectionState,
  onConfirm,
}: MigrationProps) {
  return (
    <MigrationAlert
      isOpen={true}
      onConfirm={onConfirm}
      isClaimable={tip >= collectionState.claimableBlockIndex}
    >
      <MigrationAlertItem title="Deposit amount">
        <strong>
          <img src={ncgIcon} />
          {collectionState.level}
        </strong>
      </MigrationAlertItem>
      <MigrationAlertItem title="Duration of progress">
        <span>
          {/* <strong>365</strong> days
          <br /> */}
          {collectionState.level} blocks
        </span>
      </MigrationAlertItem>
      <p>
        Monster collection has been improved to be more convenient and softer.
        Receive the previously accumulated rewards and return them to the same
        form as before. Moving on to the new monster collection?
      </p>
    </MigrationAlert>
  );
}
