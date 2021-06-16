import { tx } from "@transifex/native";
import { useLanguages } from "@transifex/react";
import React, { createContext, useEffect, useState } from "react";
import { electronStore, TRANSIFEX_TOKEN } from "../../config";

interface LocaleContext {
  locale: string;
}

const context = createContext<LocaleContext>({
  locale: "en",
});

const { Provider } = context;

export function LocaleProvider({ children }: React.PropsWithChildren<{}>) {
  const [locale, setLocale] = useState(() => electronStore.get("Locale"));
  const languages = useLanguages();

  useEffect(() => {
    if (!tx.token)
      tx.init({
        token: TRANSIFEX_TOKEN,
        currentLocale: locale,
      });
    else tx.setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    const unsubscribe = electronStore.onDidChange("Locale", (v) =>
      setLocale(v ?? "en")
    );
    return unsubscribe;
  }, []);

  return <Provider value={{ locale }}>{children}</Provider>;
}
