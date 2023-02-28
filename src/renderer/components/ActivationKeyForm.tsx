import { ipcRenderer } from "electron";
import React, { useCallback, useEffect, useState } from "react";
import { NodeInfo } from "src/config";
import { getSdk } from "src/generated/graphql-request";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

interface Props {
  onSubmit: (data: FormData) => void;
}

export interface FormData {
  activationKey: string;
}

const ACTIVATION_KEY_REGEX = /^[0-9a-f]+\/[0-9a-f]{40}$/;

type ActivationStatus =
  | ""
  | "Valid"
  | "The code is already used"
  | "The code is invalid";

export default function ActivationKeyForm({ onSubmit }: Props) {
  const [activationKey, setActivationKey] = useState("");
  const [status, setStatus] = useState<ActivationStatus>("");

  const handleInput = useCallback(async () => {
    if (!ACTIVATION_KEY_REGEX.test(activationKey)) {
      setStatus("The code is invalid");
      return;
    }

    // FIXME: Activation code validation will be implemented after MEAD update
    // if (!isActivationKeyValid(activationKey)) {
    //   setStatus("The code is invalid");
    //   return;
    // }

    const nodeInfo: NodeInfo = await ipcRenderer.invoke("get-node-info");
    const sdks = getSdk(nodeInfo.GraphqlClient());

    const { data } = await sdks.CheckActivationKey({ activationKey });

    if (data.activated) {
      setStatus("The code is already used");
    } else {
      setStatus("Valid");
    }
  }, [activationKey]);

  useEffect(() => {
    const handleFocus = async () => {
      const data = (await navigator.clipboard.readText()).trim();

      if (ACTIVATION_KEY_REGEX.test(data)) {
        setActivationKey(data);
        await handleInput();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [handleInput]);

  return (
    <>
      <TextField
        motion
        type="text"
        label="Activation Code"
        message={status}
        invalid={!["", "Valid"].includes(status)}
        onChange={handleInput}
      />
      <Button
        layout
        variant="primary"
        disabled={status !== "Valid"}
        centered
        css={{ width: 200 }}
      >
        Activate
      </Button>
    </>
  );
}
