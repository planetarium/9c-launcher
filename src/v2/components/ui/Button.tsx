import clsx from "clsx";
import React, { useCallback } from "react";
import type { LocationDescriptor } from "history";
import styles from "./styles.module.scss";
import { useHistory } from "react-router-dom";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  centeredWidth?: React.CSSProperties["width"];
}

export default function Button({
  primary,
  onClick,
  centeredWidth,
  className,
  children,
  ...buttonAttrs
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      onClick={onClick}
      style={{ width: centeredWidth, ...buttonAttrs.style }}
      className={clsx(
        {
          [styles.button]: true,
          [styles.primary]: primary,
          [styles.centered]: centeredWidth != null,
        },
        className
      )}
      {...buttonAttrs}
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
