import clsx from "clsx";
import React from "react";
import styles from "./styles.module.scss";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  invalid?: boolean;
  message?: string;
}

function randomId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const TextField = React.forwardRef(
  (
    { id = randomId(), label, invalid, message, ...inputAttrs }: TextFieldProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    return (
      <div className={clsx(styles.input, invalid && styles.invalid)}>
        <input
          type="text"
          id={id}
          placeholder="&nbsp;"
          ref={ref}
          {...inputAttrs}
        />
        <label htmlFor={id}>{label}</label>
        {message && <span className={styles.message}>{message}</span>}
      </div>
    );
  }
);

export default TextField;
