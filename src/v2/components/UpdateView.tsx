import React from "react";
import { StateFrom } from "xstate";
import type { machine } from "../utils/updateMachine";

interface UpdateViewProps {
  state: StateFrom<typeof machine>;
  progress?: number;
}

export default function UpdateView({ state, progress }: UpdateViewProps) {
  return <></>;
}
