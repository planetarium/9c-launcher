import { Box } from "@material-ui/core";
import { ipcRenderer, shell } from "electron";
import { GraphQLClient } from "graphql-request";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { get, NodeInfo } from "src/config";
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
  | "The code is already in use"
  | "The code is invalid";

export default function ActivationKeyForm({ onSubmit }: Props) {
  const [activationKey, setActivationKey] = useState("");
  const [status, setStatus] = useState<ActivationStatus>("");

  const { code } = useParams<{ code?: string }>();

  const handleInput = useCallback(async (activationKey: string) => {
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

    const sdks = getSdk(
      new GraphQLClient(
        `http://${nodeInfo.host}:${nodeInfo.graphqlPort}/graphql`
      )
    );

    const { data } = await sdks.CheckActivationKey({ activationKey });

    if (data.activated) {
      setStatus("The code is already in use");
    } else {
      setStatus("Valid");
    }
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      const data = (await navigator.clipboard.readText()).trim();

      if (ACTIVATION_KEY_REGEX.test(data)) {
        setActivationKey(data);
        await handleInput(data);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [handleInput]);

  useEffect(() => {
    if (!code) {
      return;
    }

    (async () => {
      if (ACTIVATION_KEY_REGEX.test(code)) {
        setActivationKey(code);
        await handleInput(code);
      }
    })();
  }, [code, handleInput]);

  return (
    <>
      <TextField
        motion
        type="text"
        label="Activation Code"
        message={status}
        invalid={!["", "Valid"].includes(status)}
        onChange={async (e) => {
          setActivationKey(e.currentTarget.value);
          await handleInput(e.currentTarget.value);
        }}
        value={activationKey}
      />
      <Box css={{ display: "flex", justifyContent: "end" }}>
        <Button
          variant="primary"
          css={{ minWidth: 120, height: 40, fontSize: 14 }}
          onClick={() => shell.openExternal(get("ActivationCodeUrl"))}
        >
          Get the code
        </Button>
      </Box>
      <Button
        layout
        variant="primary"
        disabled={status !== "Valid"}
        centered
        css={{ width: 200, marginTop: 160 }}
        onClick={() => onSubmit({ activationKey })}
      >
        Activate
      </Button>
    </>
  );
}
