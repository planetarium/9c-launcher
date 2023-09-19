import { on, once } from "./ipc";
import React, { createContext, useContext, useEffect, useState } from "react";
import { IPC_OPEN_URL } from "src/renderer/ipcTokens";

let urlBeforeReact: string | null = null;
once(IPC_OPEN_URL, (_, url) => (urlBeforeReact = url));

type URLContext = {
  url: URL | null;
  resetURL: () => void;
};

const context = createContext<URLContext>({
  url: null,
  resetURL: () => {},
});

const { Provider } = context;

export function ExternalURLProvider({ children }: React.PropsWithChildren<{}>) {
  const [url, setUrl] = useState<URL | null>(
    urlBeforeReact !== null ? new URL(urlBeforeReact) : null,
  );

  const resetURL = () => {
    setUrl(null);
  };

  useEffect(
    () =>
      on(IPC_OPEN_URL, (_, url) => {
        setUrl(new URL(url));
      }),
    [],
  );

  return <Provider value={{ url, resetURL }}>{children}</Provider>;
}

export function useExternalURL(): URLContext {
  return useContext(context);
}
