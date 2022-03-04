import { motion } from "framer-motion";
import React from "react";
import { T } from "src/renderer/i18n";
import { styled } from "src/v2/stitches.config";

const Button = styled(motion.button, {
  appearance: "none",
  backgroundColor: "#dc9c2d",
  padding: "5px 1rem",
  "&:disabled": {
    backgroundColor: "$gray",
  },
});

interface ClaimButtonProps {
  onClick: () => void;
  loading: boolean;
}

export function ClaimButton({ loading, onClick }: ClaimButtonProps) {
  return (
    <Button disabled={loading} onClick={onClick}>
      <T _str="Get Rewards" _tags="v2/ClaimButton" />
    </Button>
  );
}
