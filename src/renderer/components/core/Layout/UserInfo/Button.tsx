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

const transifexTags = "v2/NoticeButton";

interface NoticeButtonProps {
  onClick: () => void;
}

export function NoticeButton({ onClick }: NoticeButtonProps) {
  const eventListener = useCallback<(e: MouseEvent) => void>(
    (e) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  return (
    <Button onClick={eventListener}>
      <T _str="Monster Collection" _tags={transifexTags} />
    </Button>
  );
}
