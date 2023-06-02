import { t } from "@transifex/native";
import { shell } from "electron";
import React, { useCallback, useEffect, useState } from "react";
import { get } from "src/config";
import { T } from "../i18n";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

interface Props {
  onSubmit: (data: FormData) => void;
}

export interface FormData {
  activationKey: string;
}

type ActivationStatus = "" | "Valid" | "The code is invalid";

const transifexTags = "v2/components/ActivationKeyForm";

export default function ActivationKeyForm({ onSubmit }: Props) {
  const [activationKey, setActivationKey] = useState("");
  const [status, setStatus] = useState<ActivationStatus>("");

  const handleInput = useCallback(async (activationKey: string) => {
    // TODO: Activation code validation with portal POST
    /* 
    const res = await fetch(
      get("OnboardingPortalUrl").concat(
        "endpoint?activationCode=", activationKey
      ),
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      setStatus("The code is invalid");
    } else {
      setStatus("Valid");
    }
  */
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      const data = (await navigator.clipboard.readText()).trim();
      setActivationKey(data);
      await handleInput(data);
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [handleInput]);

  return (
    <>
      <Button
        variant="primary"
        centered
        css={{ width: 300 }}
        onClick={() => shell.openExternal(get("ActivationCodeUrl"))}
      >
        <T _str="Get the code" _tags={transifexTags} />
      </Button>
      <TextField
        motion
        type="text"
        label={t("Activation Code", { _tags: transifexTags })}
        message={t(status, { _tags: transifexTags })}
        invalid={!["", "Valid"].includes(status)}
        onChange={async (e) => {
          setActivationKey(e.currentTarget.value);
          await handleInput(e.currentTarget.value);
        }}
        value={activationKey}
      />
      <Button
        layout
        variant="primary"
        disabled={status !== "Valid"}
        centered
        onClick={() => onSubmit({ activationKey })}
      >
        <T _str="Activate" _tags={transifexTags} />
      </Button>
      -
    </>
  );
}
