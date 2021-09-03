import clsx from "clsx";
import React, { useCallback } from "react";
import type { LocationDescriptor } from "history";
import styles from "./styles.module.scss";
import { useHistory } from "react-router-dom";
import { HTMLMotionProps, motion } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  primary?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  centered?: boolean;
  motion?: boolean;
}

export default function Button({
  primary,
  onClick,
  centered,
  motion: useMotion,
  className,
  children,
  ...buttonAttrs
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <motion.button
      layout={useMotion}
      onClick={onClick}
      className={clsx(
        {
          [styles.button]: true,
          [styles.primary]: primary,
          [styles.centered]: centered,
        },
        className
      )}
      {...buttonAttrs}
    >
      {children}
    </motion.button>
  );
}

type ButtonLinkProps = Omit<ButtonProps, "onClick"> & {
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
