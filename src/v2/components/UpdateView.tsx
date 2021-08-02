import React from "react";

interface UpdateViewProps {
  state: "download" | "extract" | "copy";
  progress: number;
}

export default function UpdateView({ state, progress }: UpdateViewProps) {
  return <></>;
}
