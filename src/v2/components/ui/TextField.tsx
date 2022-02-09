import { motion } from "framer-motion";
import React from "react";
import { styled } from "src/v2/stitches.config";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  invalid?: boolean;
  message?: string;
  motion?: boolean;
}

const TextFieldWrapper = styled(motion.div, {
  position: "relative",
  outline: "none",
  border: "1px solid #979797",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  color: "White",
  variants: {
    invalid: {
      true: {
        borderColor: "$invalid",
        color: "$invalid",
      },
    },
  },
});

const Input = styled("input", {
  display: "block",
  color: "#8c8c8c",
  appearence: "none",
  backgroundColor: "transparent",
  outline: "none",
  border: "none",
  marginTop: "1.1rem",
  marginLeft: ".5rem",
  height: "2.5rem",
  "&:focus": {
    // This is done because the focus state can be visible in this specific component. It is generally discouraged: https://www.a11yproject.com/posts/never-remove-css-outlines/
    outline: "none",
  },
});

const Label = styled("label", {
  position: "absolute",
  top: "50%",
  left: 0,
  transform: "translateY(-50%)",
  transition: ".2s ease",
  margin: 0,
  marginLeft: ".6rem",
  [`${Input}:not(:placeholder-shown) ~ &, ${Input}:focus ~ &`]: {
    top: ".6rem",
    transform: "none",
  },
});

const Message = styled("span", {
  position: "absolute",
  top: ".6rem",
  right: 0,
  margin: 0,
  marginRight: ".5rem",
  color: "$accent",
  variants: {
    invalid: {
      true: {
        color: "$invalid",
      },
    },
  },
  [`${Input}:placeholder-shown ~ &`]: {
    display: "none",
  },
});

function randomId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id = randomId(),
      label,
      invalid,
      message,
      motion: useMotion,
      ...inputAttrs
    },
    ref
  ) => {
    return (
      <TextFieldWrapper invalid={invalid} layout={useMotion}>
        <Input
          type="text"
          id={id}
          placeholder="&nbsp;"
          ref={ref}
          {...inputAttrs}
        />
        <Label htmlFor={id}>{label}</Label>
        {message && <Message invalid={invalid}>{message}</Message>}
      </TextFieldWrapper>
    );
  }
);

export default TextField;
