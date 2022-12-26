import React from "react";
import { styled } from "src/renderer/stitches.config";

// Icon from Pico.css - MIT License https://github.com/picocss/pico
const checkboxChecked = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFF' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`;

const Label = styled("label", {
  display: "block",
  marginBottom: "0.25em",
});

// CSS from Pico.css - MIT License https://github.com/picocss/pico
const Input = styled("input", {
  appearance: "none",
  width: "1.25em",
  height: "1.25em",
  marginTop: "-0.125em",
  marginRight: "0.375em",
  marginLeft: "0",
  marginInlineEnd: "0.375em",
  marginInlineStart: "0",
  verticalAlign: "middle",
  border: "2px solid #01e66e",
  borderRadius: "0.25rem",
  transition: "background-color 0.2s ease-in-out",
  "&:checked, &:checked:active, &:checked:focus": {
    backgroundColor: "#01e66e",
    backgroundImage: checkboxChecked,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: ".75em auto",
  },
});

function Checkbox(
  {
    children,
    ...props
  }: React.PropsWithChildren<React.HTMLAttributes<HTMLInputElement>>,
  ref: React.Ref<HTMLInputElement>
) {
  return (
    <Label>
      <Input type="checkbox" ref={ref} {...props} />
      {children}
    </Label>
  );
}

export default React.forwardRef(Checkbox);
