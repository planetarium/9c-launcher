import React from "react";
import { styled } from "src/v2/stitches.config";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export const AvatarGroup = styled(RadioGroupPrimitive.Root, {
  display: "flex",
  flex: 1,
  justifyContent: "center",
  alignItems: "flex-end",
  marginBottom: 36,
  "> * + *": {
    marginLeft: 36,
  },
});

const AvatarLabel = styled("label", {
  textAlign: "center",
  width: 150,
});

const AvatarItem = styled(RadioGroupPrimitive.Item, {
  all: "unset",
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

export function Avatar({
  children,
  ...props
}: RadioGroupPrimitive.RadioGroupItemProps) {
  return (
    <AvatarLabel>
      <AvatarItem {...props}>
        <RadioIndicator />
      </AvatarItem>
      {children}
    </AvatarLabel>
  );
}
