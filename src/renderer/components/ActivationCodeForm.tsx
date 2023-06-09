import { t } from "@transifex/native";
import { shell } from "electron";
import React, { useCallback, useEffect, useState } from "react";
import { get } from "src/config";
import { T } from "../i18n";
import Button from "./ui/Button";
import TextField from "./ui/TextField";
import { URLSearchParams } from "url";
import debounce from "lodash.debounce";

interface Props {
  onSubmit: (data: FormData) => void;
}

export interface FormData {
  activationCode: string;
}

type ActivationStatus = "" | "Valid" | "The code is invalid";

const transifexTags = "v2/components/ActivationKeyForm";

export default function ActivationCodeForm({ onSubmit }: Props) {
  const [activationCode, setActivationCode] = useState("");
  const [status, setStatus] = useState<ActivationStatus>("");
  const handleInput = useCallback(
    debounce(async (activationCode: string) => {
      const res = await fetch(
        get("OnboardingPortalUrl") +
          "/api/account/contract?" +
          new URLSearchParams({
            activationCode: activationCode,
          })
      ).catch((e) => e);
      if (res && res.status === 200) {
        setStatus("Valid");
      } else {
        setStatus("The code is invalid");
      }
    }, 300),
    []
  );

  useEffect(() => {
    const handleFocus = async () => {
      const data = (await navigator.clipboard.readText()).trim();
      setActivationCode(data);
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
          setActivationCode(e.currentTarget.value);
          await handleInput(e.currentTarget.value);
        }}
        value={activationCode}
      />
      <Button
        layout
        variant="primary"
        disabled={status !== "Valid"}
        centered
        onClick={() => onSubmit({ activationCode })}
      >
        <T _str="Activate" _tags={transifexTags} />
      </Button>
      -
    </>
  );
}
