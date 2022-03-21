import React from "react";
import { StateFrom } from "xstate";
import type machine from "../../machines/updateMachine";
import { styled } from "../../stitches.config";
import background from "src/v2/resources/bg-character.png";
import StatusBar from "./StatusBar";
import { t } from "@transifex/native";

// Note that while this is in a views/ folder it isn't a route.
// This is because it's a view that is rendered by the APVSubscriptionProvider component.

const transifexTags = "v2/update";

interface UpdateViewProps {
  state: StateFrom<typeof machine>;
  progress?: number;
}

const Root = styled("div", {
  width: "100%",
  height: "100%",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
});

const FixedStatusBar = styled(StatusBar, {
  position: "fixed",
  bottom: 50,
  left: 50,
});

function getMessage(state: StateFrom<typeof machine>): string {
  switch (state.value) {
    case "download":
      return t("Downloading the new version...", { _tags: transifexTags });
    case "extract":
      return t("Extracting the new version...", { _tags: transifexTags });
    case "copy":
      return t("Copying files...", { _tags: transifexTags });
  }
  throw new Error("unreachable");
}

export default function UpdateView({ state, progress }: UpdateViewProps) {
  return (
    <Root>
      {!state.matches("ok") && (
        <FixedStatusBar progress={progress} message={getMessage(state)} />
      )}
    </Root>
  );
}
