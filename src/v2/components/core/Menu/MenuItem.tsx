import React from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";

interface MenuItemProps {
  onClick: () => void;
  icon: string;
  text: string;
  disabled?: boolean;
}

export default function MenuItem({
  onClick,
  icon,
  text,
  disabled,
}: MenuItemProps) {
  return (
    <div
      className={clsx(styles.menuItem, disabled && styles.disabledMenuItem)}
      onClick={onClick}
    >
      <img alt="" src={icon} />
      <span>{text}</span>
    </div>
  );
}
