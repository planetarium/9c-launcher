import React, { useCallback } from "react";
import type { LocationDescriptor } from "history";
import { useHistory } from "react-router-dom";
import { HTMLMotionProps, motion } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import type * as Stitches from "@stitches/react";

const Button = styled(motion.button, {
  backgroundColor: "#4f4f4f",
  height: 72,
  margin: "16px 40px",
  padding: "0 1em",
  fontSize: 32,
  border: "none",
  color: "White",
  fontWeight: "bold",
  variants: {
    type: {
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
