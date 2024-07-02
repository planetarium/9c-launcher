import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { styled } from "src/renderer/stitches.config";

export const RadioGroup = RadioGroupPrimitive.Root;

const Radio = styled(RadioGroupPrimitive.Item, {
  all: "unset",
  backgroundColor: "white",
  width: 25,
  height: 25,
  borderRadius: "100%",
  boxShadow: `0 2px 10px $gray`,
});
const RadioIndicator = styled(RadioGroupPrimitive.Indicator, {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  position: "relative",
  "&::after": {
    content: '""', // It looks wrong, but it's right.
    display: "block",
    width: 11,
    height: 11,
    borderRadius: "50%",
    backgroundColor: "$primary",
  },
});

const Label = styled("label", {
  display: "flex",
  margin: "10px 0",
  alignItems: "center",
  color: "white",
  userSelect: "none",
  [`& ${Radio}`]: {
    marginRight: 10,
  },
});

export function RadioItem({
  children,
  ...props
}: RadioGroupPrimitive.RadioGroupItemProps) {
  return (
    <Label>
      <Radio {...props}>
        <RadioIndicator />
      </Radio>
      {children}
    </Label>
  );
}
