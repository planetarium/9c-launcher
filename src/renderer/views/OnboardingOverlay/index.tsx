import React from "react";
import { observer } from "mobx-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { styled } from "src/renderer/stitches.config";
import H1 from "src/renderer/components/ui/H1";
import Button from "src/renderer/components/ui/Button";
import OverlayBase from "src/renderer/components/core/OverlayBase";
import { OverlayProps } from "src/utils/types";

const Section = styled(motion.section, {
  display: "flex",
  flexDirection: "column",
  height: "100%",
});
const ButtonBar = styled(motion.div, {
  alignSelf: "center",
  marginTop: "auto",
  [`& > ${Button}`]: {
    margin: "0 16px",
  },
});

const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  active: {
    opacity: 1,
  },
};

interface SectionProps {
  next: () => void;
}

function IntroductionSection({ next }: SectionProps) {
  return (
    <Section
      variants={sectionVariants}
      initial="hidden"
      animate="active"
      exit="hidden"
    >
      <H1>Nine Chronicles is fully decentralized game!</H1>
      <p>
        You can play with your friends, or with other people on the internet.
      </p>
      <ButtonBar>
        <Button onClick={next}>Next</Button>
      </ButtonBar>
    </Section>
  );
}

function OnboardingOverlay({ onClose, isOpen }: OverlayProps) {
  return (
    <OverlayBase isOpen={isOpen} onDismiss={onClose}>
      <AnimatePresence exitBeforeEnter>
        <IntroductionSection next={onClose} />
      </AnimatePresence>
    </OverlayBase>
  );
}

export default observer(OnboardingOverlay);
