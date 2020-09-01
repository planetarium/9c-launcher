import React from "react";

import pages from "./index.json";

interface LocaleContext {
  locale: string;
}

const context = React.createContext<LocaleContext>({
  locale: "en",
});

export function useLocale(pageName: keyof typeof pages) {
  const { locale } = React.useContext(context);

  const fixedLocale = locale.startsWith("en") ? "en" : locale;

  const page = pages[pageName];
  return function (name: string) {
    // @ts-ignore
    const message = page[name] as {
      [locale: string]: string | string[] | undefined;
      en: string | string[];
    };
    return message[fixedLocale] ?? message.en;
  };
}

export default context.Provider;
