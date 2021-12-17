import { DialogOverlay, DialogContent } from "@reach/dialog";
import { styled } from "src/v2/stitches.config";
import "@reach/dialog/styles.css";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const AnimatedDialogOverlay = styled(motion(DialogOverlay), {
  "&&": {
    overflow: "hidden",
  },
});

const AnimatedDialogContent = styled(motion(DialogContent), {
  padding: 36,
  boxSizing: "border-box",
  height: 600,
  dragable: false,
  "&&": {
    backgroundColor: "#1d1e1ff2",
    width: 1124,
  },
});

export default function OverlayBase({
  children,
  isOpen,
  ...props
}: React.ComponentProps<typeof AnimatedDialogOverlay>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <AnimatedDialogOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        >
          <AnimatedDialogContent
            initial={{ translateY: 150 }}
            animate={{ translateY: 0 }}
            exit={{ translateY: 500 }}
          >
            {children}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      )}
    </AnimatePresence>
  );
}
