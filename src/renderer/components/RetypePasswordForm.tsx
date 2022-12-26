import React from "react";
import { useRef } from "react";
import { AnimateSharedLayout } from "framer-motion";
import { useForm } from "react-hook-form";
import zxcvbn from "zxcvbn";
import Button from "./ui/Button";
import TextField, { PasswordField } from "./ui/TextField";
import { styled } from "../stitches.config";

interface Props {
  onSubmit: (data: FormData) => void;
  useActivitionKey?: boolean;
  address?: string;
}

export interface FormData {
  password: string;
  activationKey?: string;
}

const passwordStrengthValidator = (password: string) =>
  zxcvbn(password).score >= 2 || zxcvbn(password).feedback.warning;

const Form = styled("form", {
  "& > * + *": {
    marginBlockStart: "1rem",
  },
});

export default function RetypePasswordForm({
  onSubmit,
  useActivitionKey,
  address,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<FormData & { __confirm: string }>({
    mode: "onChange",
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {address && <TextField label="ID" readOnly value={address} />}
      <PasswordField
        label="Password"
        message={errors.password ? "Too weak" : "Strong"}
        invalid={!!errors.password}
        {...register("password", {
          required: true,
          validate: passwordStrengthValidator,
          deps: ["__confirm"],
        })}
      />
      <PasswordField
        label="Verify Password"
        message={errors.__confirm ? "Passwords doesn't match" : "Correct"}
        invalid={!!errors.__confirm}
        {...register("__confirm", {
          required: true,
          validate(v) {
            return v === watch("password");
          },
          deps: ["password"],
        })}
      />
      {useActivitionKey && (
        <TextField
          motion
          type="text"
          label="Invitation Code"
          message={errors.activationKey ? "Invalid code" : "Correct"}
          invalid={errors.activationKey != null}
          {...register("activationKey", {
            required: true,
            pattern: /^[0-9a-f]+\/[0-9a-f]{40}$/,
          })}
        />
      )}
      <Button layout variant="primary" centered css={{ width: 200 }}>
        NEXT
      </Button>
    </Form>
  );
}
