import { DialogOverlay, DialogContent } from "@reach/dialog";
import { styled } from "src/v2/stitches.config";
import "@reach/dialog/styles.css";
import { AnimatePresence, motion } from "framer-motion";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import React from "react";
import Close from "@material-ui/icons/Close";

const SCROLLBAR_SIZE = 10;

const ScrollAreaRoot = styled(ScrollArea.Root, {
  position: "relative",
  margin: "10vh auto",
  width: 1124,
  height: 600,
});

const ScrollAreaViewport = styled(ScrollArea.Viewport, {
  width: "100%",
  height: "100%",
});

const ScrollAreaScrollbar = styled(ScrollArea.Scrollbar, {
  display: "flex",
  userSelect: "none",
  touchAction: "none",
  borderRadius: SCROLLBAR_SIZE,
  padding: 2,
  transition: "background 160ms ease-out",
  "&:hover": { backgroundColor: "$gray80" },
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
});

const ScrollAreaThumb = styled(ScrollArea.Thumb, {
  flex: 1,
  background: "$primary",
  borderRadius: SCROLLBAR_SIZE,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    minWidth: 44,
    minHeight: 44,
  },
});

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
          <ScrollAreaRoot>
            <AnimatedDialogContent
              initial={{ translateY: 150 }}
              animate={{ translateY: 0 }}
              exit={{ translateY: 500 }}
              className={className}
            >
              <ScrollAreaViewport>{children}</ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </AnimatedDialogContent>
          </ScrollAreaRoot>
        </AnimatedDialogOverlay>
      )}
    </AnimatePresence>
  );
}
