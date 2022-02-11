import React from "react";
import { observer } from "mobx-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import H1 from "src/v2/components/ui/H1";
import Button from "src/v2/components/ui/Button";
import { useStore } from "src/v2/utils/useStore";
import OverlayBase from "src/v2/components/core/OverlayBase";

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

function MiningSection({ next }: SectionProps) {
  return (
    <Section
      variants={sectionVariants}
      initial="hidden"
      animate="active"
      exit="hidden"
    >
      <H1>You can get the NCG</H1>
      <p>You can change this in setting later.</p>
      <ButtonBar>
        <Button>NO</Button>
        <Button variant="primary" onClick={next}>
          OK
        </Button>
      </ButtonBar>
    </Section>
  );
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

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function OnboardingOverlay({ onClose, isOpen }: OnboardingOverlayProps) {
  const [section, setState] = React.useState<"mining" | "introduce">("mining");
  const next = () => (section === "mining" ? setState("introduce") : onClose());

  return (
    <OverlayBase isOpen={isOpen} onDismiss={onClose}>
      <AnimatePresence exitBeforeEnter>
        {section === "mining" && <MiningSection next={next} />}
        {section === "introduce" && <IntroductionSection next={next} />}
      </AnimatePresence>
    </OverlayBase>
  );
}

export default observer(OnboardingOverlay);
