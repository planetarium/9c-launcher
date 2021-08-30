import clsx from "clsx";
import React from "react";
import styles from "./styles.module.scss";

export default function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={clsx(styles.heading, props.className)} {...props} />;
}
