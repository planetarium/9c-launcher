import { motion } from "framer-motion";
import React, { MouseEvent, useCallback } from "react";
import { T } from "src/renderer/i18n";
import { styled } from "src/renderer/stitches.config";

export const Button = styled(motion.button, {
  appearance: "none",
  backgroundColor: "#dc9c2d",
  border: "none",
  padding: "5px 1rem",
  "&:disabled": {
    backgroundColor: "$gray",
    color: "white",
  },
});

const transifexTags = "v2/MigrateButton";

interface MigrateButtonProps {
  onClick: () => void;
  loading: boolean;
}

export function MigrateButton({ loading, onClick }: MigrateButtonProps) {
  const eventListener = useCallback<(e: MouseEvent) => void>(
    (e) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  return (
    <Button disabled={loading} onClick={eventListener}>
      {loading ? (
        <T _str="Loading" _tags={transifexTags} />
      ) : (
        <T _str="Migrate Stake" _tags={transifexTags} />
      )}
    </Button>
  );
}
