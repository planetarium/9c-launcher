import { DialogOverlay, DialogContent } from "@reach/dialog";
import { styled } from "src/renderer/stitches.config";
import "@reach/dialog/styles.css";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import Close from "@material-ui/icons/Close";

const AnimatedDialogOverlay = styled(motion(DialogOverlay), {
  "&&": {
    overflow: "hidden",
    dragable: false,
  },
  variants: {
    high: {
      true: {
        zIndex: 3,
      },
    },
  },
});

const AnimatedDialogContent = styled(motion(DialogContent), {
  position: "relative",
  padding: 36,
  boxSizing: "border-box",
  height: 600,
  dragable: false,
  overflow: "hidden",
  "&&": {
    backgroundColor: "#1d1e1ff2",
    width: 1124,
  },
});

const CloseButtonStyled = styled("button", {
  position: "absolute",
  top: 20,
  right: 20,
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white",
  zIndex: 1,
});

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <CloseButtonStyled onClick={onClick}>
      <Close />
    </CloseButtonStyled>
  );
}

export default function OverlayBase({
  children,
  isOpen,
  className,
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
            className={className}
          >
            {children}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      )}
    </AnimatePresence>
  );
}
