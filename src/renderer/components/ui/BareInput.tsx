import React from "react";
import { styled } from "src/renderer/stitches.config";

const BareInputWrapper = styled("span", {
  position: "relative",
  display: "inline-block",
});

const LayoutCalculator = styled("span", {
  visibility: "hidden",
});

const BareInputStyled = styled("input", {
  appearance: "none",
  all: "unset",
  position: "absolute",
  width: "100%",
  left: 0,
  top: "50%",
  transform: "translateY(-50%)",
  "&::-webkit-inner-spin-button": {
    display: "none",
  },
  "&:invalid": {
    color: "#ff4343",
  },
});

function BareInput(
  { value, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <BareInputWrapper>
      <LayoutCalculator aria-hidden>{String(value)}</LayoutCalculator>
      <BareInputStyled ref={ref} value={value} {...props} />
    </BareInputWrapper>
  );
}

export default React.forwardRef(BareInput);
