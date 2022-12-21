import React, { useMemo, useReducer } from "react";
import {
  LegacyCollectionStateQuery,
  useMigrateMonsterCollectionLazyQuery,
} from "src/v2/generated/graphql";
import { useStore } from "src/v2/utils/useStore";
import { MigrationAlert, MigrationAlertItem } from "./dialog";
import ncgIcon from "src/v2/resources/collection/items/ncg.png";
import ClaimCollectionRewardsOverlay from "../ClaimCollectionRewardsOverlay";
import { useTx } from "src/v2/utils/useTx";

interface MigrationProps {
  tip: number;
  collectionState: NonNullable<
    LegacyCollectionStateQuery["stateQuery"]["monsterCollectionState"]
  >;
  collectionSheet: LegacyCollectionStateQuery["stateQuery"]["monsterCollectionSheet"];
  onActionTxId(txId: string): void;
  onClose?(): void;
}

// Slight modification of src\collection\common\utils.ts:16
function getRemain(blocks: number) {
  const miniutes = Math.floor(blocks / 60);
  const hour = Math.round(miniutes / 60);
  const days = Math.round(hour / 24);

  if (days >= 1) return { number: days, unit: "days" } as const;
  if (hour >= 1) return { number: hour, unit: "hours" } as const;
  if (miniutes >= 1) return { number: miniutes, unit: "minutes" } as const;

  return { number: blocks, unit: "blocks" } as const;
}

export default function Migration({
  tip,
  collectionState,
  collectionSheet,
  onActionTxId,
  onClose,
}: MigrationProps) {
  const [isOpen, open] = useReducer(() => true, false);
  const account = useStore("account");
  const isClaimable = tip >= collectionState.claimableBlockIndex;
  const [migrateMonsterCollection, { data, loading, error }] =
    useMigrateMonsterCollectionLazyQuery();
  const tx = useTx();

  const deposit = useMemo(
    () =>
      collectionSheet?.orderedList
        ?.flatMap((item) =>
          item && item.level <= collectionState.level ? item.requiredGold : []
        )
        .reduce((a, b) => a + b, 0),
    [collectionState, collectionSheet]
  );
  const elapsedBlocks = tip - collectionState.startedBlockIndex;
  const elapsed = getRemain(elapsedBlocks);

  return (
    <MigrationAlert
      isOpen={true}
      onConfirm={open}
      onCancel={onClose}
      isClaimable={isClaimable}
      items={
        <>
          <MigrationAlertItem title="Deposit amount">
            <strong>
              <img src={ncgIcon} />
              {deposit}
            </strong>
          </MigrationAlertItem>
          <MigrationAlertItem title="Last updated">
            <span>
              <strong>{elapsed.number}</strong> {elapsed.unit}
              {elapsed.unit !== "blocks" && (
                <>
                  <br />
                  {elapsedBlocks} blocks
                </>
              )}
            </span>
          </MigrationAlertItem>
        </>
      }
    >
      <p>
        Monster collection has been improved to be more convenient and softer.
        Receive the previously accumulated rewards and return them to the same
        form as before. Moving on to the new monster collection?
      </p>
      <ClaimCollectionRewardsOverlay
        tip={tip}
        isOpen={isOpen}
        onClose={() => {}}
        onConfirm={(avatar) => {
          account
            .getPublicKeyString()
            .then((v) =>
              migrateMonsterCollection({
                variables: {
                  publicKey: v,
                  avatarAddress: avatar.address.replace("0x", ""),
                },
              })
            )
            .then(() => tx(data?.actionTxQuery.migrateMonsterCollection))
            .then(
              (txId) =>
                txId.data?.stageTransaction &&
                onActionTxId(txId.data.stageTransaction)
            )
            .catch((e) => console.error(e));
        }}
      />
    </MigrationAlert>
  );
}
