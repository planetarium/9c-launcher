import { observer } from "mobx-react";
import React from "react";
import { OverlayProps } from "src/utils/types";
import MigrateContent from "./MigrateContent";

export interface MigrateCollectionRewardsOverlayProps extends OverlayProps {
  tip: number;
  onConfirm(): void;
}

const transifexTags = "v2/views/MigrateCollectionRewardsOverlay";

function MigrateCollectionRewardsOverlay({
  isOpen,
  onClose,
  ...collectionData
}: MigrateCollectionRewardsOverlayProps) {
  return (
    <MigrateContent {...collectionData} isOpen={isOpen} onClose={onClose} />
  );
}

export default observer(MigrateCollectionRewardsOverlay);
