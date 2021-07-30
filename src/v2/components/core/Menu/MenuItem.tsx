import React from 'react';
import styles from "./styles.module.scss";

interface MenuItemProps {
  onClick: () => void;
  icon: string;
  text: string;
}

export default function MenuItem({ onClick, icon, text }: MenuItemProps) {
  return <div className={styles.menuItem} onClick={onClick}>
    <img alt="" src={icon} />
    <span>{text}</span>
  </div>;
}
