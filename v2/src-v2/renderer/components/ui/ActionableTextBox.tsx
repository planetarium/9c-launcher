import { motion } from "framer-motion";
import { styled } from "src/renderer/stitches.config";

export const ActionableTextBoxWrapper = styled(motion.div, {
  position: "relative",
  outline: "none",
  border: "1px solid #979797",
  borderRadius: 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "White",
  height: "3rem",
  padding: "0 1rem",
  variants: {
    invalid: {
      true: {
        borderColor: "$invalid",
        color: "$invalid",
      },
    },
  },
});

export const TextBox = styled(motion.span, {
  lineHeight: "3rem",
});
