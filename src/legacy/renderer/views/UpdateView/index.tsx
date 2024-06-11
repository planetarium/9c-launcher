import React from "react";
import { StateFrom } from "xstate";
import type { updateMachine } from "src/renderer/machines/updateMachine";
import { styled } from "../../stitches.config";
import background from "src/renderer/resources/bg-character.png";
import StatusBar from "./StatusBar";
import { t } from "@transifex/native";
import WindowControls from "src/renderer/components/core/Layout/WindowControls";

// Note that while this is in a views/ folder it isn't a route.
// This is because it's a view that is rendered by the APVSubscriptionProvider component.

const transifexTags = "v2/update";

interface UpdateViewProps {
  state: StateFrom<typeof updateMachine>;
  progress?: number;
}

const Root = styled("div", {
  width: "100%",
  height: "100%",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
  dragable: true,
});

const FixedStatusBar = styled(StatusBar, {
  position: "fixed",
  bottom: 50,
  left: 50,
});

function getMessage(state: StateFrom<typeof updateMachine>): string {
  if (state.matches({ playerUpdate: "download" })) {
    return t("Downloading the new version player...", {
      _tags: transifexTags,
    });
  } else if (state.matches({ playerUpdate: "extract" })) {
    return t("Extracting the new version player...", {
      _tags: transifexTags,
    });
  } else {
    throw new Error("unreachable");
  }
}

export default function UpdateView({ state, progress }: UpdateViewProps) {
  return (
    <Root>
      <WindowControls color="black" />
      {!state.matches("ok") && (
        <FixedStatusBar progress={progress} message={getMessage(state)} />
      )}
    </Root>
  );
}
