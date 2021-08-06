import clsx from "clsx";
import React, { useCallback } from "react";
import type { LocationDescriptor } from "history";
import styles from "./styles.module.scss";
import { useHistory } from "react-router-dom";

export interface ButtonProps {
  primary?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  primary,
  onClick,
  className,
  children,
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      onClick={onClick}
      className={clsx(styles.button, primary && styles.primary, className)}
    >
      {children}
    </button>
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
