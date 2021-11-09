import React from "react";
import { observer } from "mobx-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import H1 from "src/v2/components/ui/H1";
import Button from "src/v2/components/ui/Button";
import { useStore } from "src/v2/utils/useStore";

const Overlay = styled(motion.div, {
  backgroundColor: "#1d1e1ff2",
  padding: 36,
  margin: 88,
  boxSizing: "border-box",
  width: "100%",
  height: 600,
});

const Section = styled(motion.section, {
  display: "flex",
  flexDirection: "column",
  height: "100%",
});
const ButtonBar = styled(motion.div, {
  alignSelf: "center",
  marginTop: "auto",
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

function OnboardingOverlay() {
  const overlay = useStore("overlay");
  const [section, setState] = React.useState<"mining" | "introduce">("mining");
  const next = () =>
    section === "mining" ? setState("introduce") : overlay.close();

  return (
    <Overlay
      initial={{ translateY: 150 }}
      animate={{ translateY: 0 }}
      exit={{ translateY: "50vh" }}
    >
      <AnimatePresence exitBeforeEnter>
        {section === "mining" && <MiningSection next={next} />}
        {section === "introduce" && <IntroductionSection next={next} />}
      </AnimatePresence>
    </Overlay>
  );
}

export default observer(OnboardingOverlay);
