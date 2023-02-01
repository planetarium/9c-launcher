import React from "react";
import { useRef } from "react";
import { AnimateSharedLayout } from "framer-motion";
import { useForm } from "react-hook-form";
import zxcvbn from "zxcvbn";
import Button from "./ui/Button";
import TextField, { PasswordField } from "./ui/TextField";
import { ExtLink } from "src/renderer/components/ui/Link";
import { styled } from "../stitches.config";

interface Props {
  onSubmit: (data: FormData) => void;
  useActivationKey?: boolean;
  address?: string;
  activationCodeUrl?: string;
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

export default function RetypePasswordForm({
  onSubmit,
  useActivationKey,
  activationCodeUrl,
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
      {useActivationKey && (
        <TextField
          motion
          type="text"
          label="Activation Code"
          message={errors.activationKey ? "Invalid code" : "Correct"}
          invalid={errors.activationKey != null}
          {...register("activationKey", {
            required: true,
            pattern: /^[0-9a-f]+\/[0-9a-f]{40}$/,
          })}
        />
      )}
      {activationCodeUrl && (
        <ExtLink target="_blank" href={activationCodeUrl}>
          Get the activation code
        </ExtLink>
      )}
      <Button layout variant="primary" centered css={{ width: 200 }}>
        NEXT
      </Button>
    </Form>
  );
}
