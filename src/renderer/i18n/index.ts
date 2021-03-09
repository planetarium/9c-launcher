import { createContext, useContext } from "react";

import I18n, {
  Locale,
  OptionalLocale,
  RequireLocale,
  Phrases,
} from "../../interfaces/i18n";

import pages from "./pages-load";

interface LocaleContext {
  locale: Locale;
}

const context = createContext<LocaleContext>({
  locale: "en",
});

export const supportedLocales = {
  ko: "한국어",
  en: "English",
  es: "Español",
  id: "Bahasa Indonesia",
  ja: "日本語",
  km: "ភាសាខ្មែរ",
  lt: "Lietuvių",
  nl: "Nederlands",
  pl: "polski",
  pt: "Português",
  "pt-BR": "Português (Brazil)",
  th: "ภาษาไทย",
  de: "Deutsch",
  "zh-Hans": "中文 (简体)",
} as Record<Locale, string>;

type PageKey = keyof I18n;

export function useLocale<Page extends I18n[PageKey]>(pageName: PageKey) {
  const { locale } = useContext(context);
  const selectedLocale = locale in supportedLocales ? locale : "en";

  const page = pages[pageName];
  return {
    selectedLocale,
    supportedLocales,
    locale: function (name: keyof Page) {
      // @ts-ignore
      const message = page[name] as Phrases;
      return message[selectedLocale] ?? message.en;
    },
  };
}

export default context.Provider;
