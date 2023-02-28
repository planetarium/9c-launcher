import React from "react";
import { useForm } from "react-hook-form";
import zxcvbn from "zxcvbn";
import { styled } from "../stitches.config";
import Button from "./ui/Button";
import TextField, { PasswordField } from "./ui/TextField";

interface Props {
  onSubmit: (data: FormData) => void;
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
  a: {
    display: "block",
  },
});

export default function RetypePasswordForm({ onSubmit, address }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
      <Button layout variant="primary" centered css={{ width: 200 }}>
        NEXT
      </Button>
    </Form>
  );
}
