import { on } from "./ipc";
import React, { createContext, useContext, useEffect, useState } from "react";
import { IPC_OPEN_URL } from "../ipcTokens";

const context = createContext<string | null>(null);

const { Provider } = context;

export function ExternalURLProvider({ children }: React.PropsWithChildren<{}>) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(
    () =>
      on(IPC_OPEN_URL, (_, url) => {
        setUrl(url);
      }),
    []
  );

  return <Provider value={url}>{children}</Provider>;
}

export function useExternalURL(): string | null {
  return useContext(context);
}
