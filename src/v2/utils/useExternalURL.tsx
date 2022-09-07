import { on, once } from "./ipc";
import React, { createContext, useContext, useEffect, useState } from "react";
import { IPC_OPEN_URL } from "../ipcTokens";

let urlBeforeReact: string | null = null;
once(IPC_OPEN_URL, (_, url) => (urlBeforeReact = url));

const context = createContext<string | null>(null);

const { Provider } = context;

export function ExternalURLProvider({ children }: React.PropsWithChildren<{}>) {
  const [url, setUrl] = useState<string | null>(urlBeforeReact);

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
