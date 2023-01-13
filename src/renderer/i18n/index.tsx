import { tx } from "@transifex/native";
import { useT } from "@transifex/react";
import React, {
  createContext,
  ReactChild,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { userConfigStore, get, TRANSIFEX_TOKEN } from "src/config";

interface LocaleContext {
  locale: string;
}

const context = createContext<LocaleContext>({
  locale: "en",
});

const { Provider } = context;

export function LocaleProvider({ children }: React.PropsWithChildren<{}>) {
  const [locale, setLocale] = useState(() => get("Locale") ?? "en");

  useEffect(() => {
    const unsubscribe = userConfigStore.onDidChange("Locale", (v) =>
      setLocale(v ?? "en")
    );
    return () => void unsubscribe();
  }, []);

  useEffect(() => {
    if (!tx.token)
      tx.init({
        token: TRANSIFEX_TOKEN,
      });
    tx.setCurrentLocale(locale);

    validateLocale(locale).then((valid) => valid || setLocale("en"));
  }, [locale]);

  return <Provider value={{ locale }}>{children}</Provider>;
}

export async function validateLocale(locale: string): Promise<boolean> {
  const languages = await tx.getLanguages();
  return languages.some((lang: Record<"code", string>) => {
    return locale.startsWith(lang.code.replace("_", "-"));
  });
}

type TransifexProps<T> = {
  _str: string;
  _tags: string;
} & T;

export function T<Content = {}>({
  _str,
  ...props
}: TransifexProps<Content>): JSX.Element {
  const node: ReactChild = useT()(_str, props);
  return <>{newlineToLineBreak(node)}</>;
}

function newlineToLineBreak(node: ReactChild): ReactNode {
  if (typeof node == "number") {
    return node;
  } else if (typeof node == "string") {
    const tokens = node.split("\n");
    if (tokens.length === 1) return node;
    return tokens.flatMap((token) => [token, <br />]).slice(0, -1);
  } else if (Array.isArray(node.props.children)) {
    return node.props.children.map(newlineToLineBreak);
  } else {
    return newlineToLineBreak(node.props.children);
  }
}
