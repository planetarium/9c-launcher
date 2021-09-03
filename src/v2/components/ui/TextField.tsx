import clsx from "clsx";
import { motion } from "framer-motion";
import React from "react";
import styles from "./styles.module.scss";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  invalid?: boolean;
  message?: string;
  motion?: boolean;
}

function randomId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const TextField = React.forwardRef(
  (
    {
      id = randomId(),
      label,
      invalid,
      message,
      motion: useMotion,
      ...inputAttrs
    }: TextFieldProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const Div = useMotion ? motion.div : "div";

    return (
      <Div
        className={clsx(styles.input, invalid && styles.invalid)}
        layout={useMotion}
      >
        <input
          type="text"
          id={id}
          placeholder="&nbsp;"
          ref={ref}
          {...inputAttrs}
        />
        <label htmlFor={id}>{label}</label>
        {message && <span className={styles.message}>{message}</span>}
      </Div>
    );
  }
);

export default TextField;
