import React, { useCallback } from "react";
import type { LocationDescriptor } from "history";
import { useHistory } from "react-router-dom";
import { HTMLMotionProps, motion } from "framer-motion";
import { styled } from "src/renderer/stitches.config";
import type * as Stitches from "@stitches/react";

const Button = styled(motion.button, {
  backgroundColor: "#4f4f4f",
  height: 72,
  minWidth: 200,
  verticalAlign: "bottom",
  padding: "0 1em",
  fontSize: 32,
  border: "none",
  color: "White",
  fontWeight: "bold",
  cursor: "pointer",
  "&:disabled": {
    backgroundColor: "#4f4f4f",
    color: "$gray",
    cursor: "not-allowed",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
      },
    },
    centered: {
      true: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
      },
    },
  },
});

export default Button;

type ButtonLinkProps = Omit<HTMLMotionProps<"button">, "onClick" | "type"> &
  Stitches.VariantProps<typeof Button> & {
    to: LocationDescriptor;
  };

export function ButtonLink({
  to,
  ...props
}: React.PropsWithChildren<ButtonLinkProps>) {
  const history = useHistory();
  const onClick = useCallback(() => history.push(to), [history, to]);
  return <Button {...props} onClick={onClick} />;
}

export const ButtonBar = styled("div", {
  display: "flex",
  "& > * + *": { marginLeft: 16 },
  justifyContent: "center",
  variants: {
    placement: {
      bottom: {
        marginTop: "auto",
      },
    },
  },
});
