import React from "react";
import OverlayBase from "src/v2/components/core/OverlayBase";

interface ClaimCollectionRewardsOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function ClaimCollectionRewardsOverlay({
  isOpen,
  onClose,
}: ClaimCollectionRewardsOverlayProps) {
  return <OverlayBase isOpen={isOpen} onDismiss={onClose} />;
}
