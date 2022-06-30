import { useT } from "@transifex/react";
import React, { ReactChild, ReactNode } from "react";
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
