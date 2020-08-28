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

  const page = pages[pageName];
  return function (name: string) {
    // @ts-ignore
    const message = page[name] as { [name: string]: string | string[] };
    return message[locale] ?? message.en;
  };
}

export default context.Provider;
