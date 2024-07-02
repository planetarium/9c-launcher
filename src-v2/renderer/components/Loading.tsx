import { motion } from "framer-motion";
import { keyframes, styled } from "src/renderer/stitches.config";

const rotating = keyframes({
  from: {
    transform: "rotate(0deg)",
  },
  to: {
    transform: "rotate(360deg)",
  },
});

export const LoadingBackdrop = styled(motion.div, {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",

  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 3,

  backgroundColor: "rgba(0, 0, 0, 0.8)",
});

export const LoadingImage = styled("img", {
  display: "block",
  animation: `${rotating} 1s linear infinite`,
});

export const LoadingDescription = styled("p", {
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  color: "#ebceb1",
  fontSize: 18,
  textAlign: "center",
  margin: 9,
});
