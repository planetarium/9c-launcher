import { t } from "@transifex/native";
import React from "react";
import { useForm } from "react-hook-form";
import loading from "src/renderer/resources/icons/loading.png";
import zxcvbn from "zxcvbn";
import { T } from "../i18n";
import { styled } from "../stitches.config";
import { LoadingImage } from "../views/MonsterCollectionOverlay/base";
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

const transifexTags = "v2/components/RetypePasswordForm";

export default function RetypePasswordForm({ onSubmit, address }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<FormData & { __confirm: string }>({
    mode: "onChange",
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {address && <TextField label="ID" readOnly value={address} />}
      <PasswordField
        label={t("Password", { _tags: transifexTags })}
        message={t(errors.password ? "Too weak" : "Strong", {
          _tags: transifexTags,
        })}
        invalid={!!errors.password}
        {...register("password", {
          required: true,
          validate: passwordStrengthValidator,
          deps: ["__confirm"],
        })}
      />
      <PasswordField
        label={t("Verify Password", { _tags: transifexTags })}
        message={t(errors.__confirm ? "Passwords doesn't match" : "Correct", {
          _tags: transifexTags,
        })}
        invalid={!!errors.__confirm}
        {...register("__confirm", {
          required: true,
          validate(v) {
            return v === watch("password");
          },
          deps: ["password"],
        })}
      />
      <Button
        type="submit"
        layout
        variant="primary"
        centered
        disabled={!isValid || isSubmitting}
        css={{
          width: 200,
          marginTop: "160px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isSubmitting ? (
          <LoadingImage src={loading} />
        ) : (
          <T _str="NEXT" _tags={transifexTags} />
        )}
      </Button>
    </Form>
  );
}
