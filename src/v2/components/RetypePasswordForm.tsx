import React from "react";
import { useRef } from "react";
import { AnimateSharedLayout } from "framer-motion";
import { useForm } from "react-hook-form";
import zxcvbn from "zxcvbn";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

interface Props {
  onSubmit: (data: FormData) => void;
  useActivitionKey?: boolean;
}

export interface FormData {
  password: string;
  activationKey?: string;
}

const passwordStrengthValidator = (password: string) =>
  zxcvbn(password).score >= 2 || zxcvbn(password).feedback.warning;

export default function RetypePasswordForm({
  onSubmit,
  useActivitionKey,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    mode: "onChange",
  });

  const confirmRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AnimateSharedLayout>
        <TextField
          motion
          type="password"
          label="Password"
          message={errors.password?.type === "password" ? "Too weak" : "Strong"}
          invalid={errors.password?.type !== "confirm"}
          {...register("password", {
            required: true,
            validate: {
              password: passwordStrengthValidator,
              confirm: (v) => v === confirmRef.current?.value,
            },
          })}
        />
        <TextField
          motion
          type="password"
          label="Verify Password"
          ref={confirmRef}
          message={
            errors.password?.type === "confirm"
              ? "Passwords doesn't match"
              : "Correct"
          }
          invalid={errors.password?.type === "confirm"}
          onChange={() => trigger("password")}
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
        <Button motion primary centered style={{ width: "200px" }}>
          NEXT
        </Button>
      </AnimateSharedLayout>
    </form>
  );
}
