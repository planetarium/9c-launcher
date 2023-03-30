import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import "core-js/proposals/array-find-from-last";
import "remove-focus-outline";
import { initializeSentry } from "src/utils/sentry";
import App from "./App";

import { getCurrentWindow } from "@electron/remote";
import _refiner from "refiner-js";
import { t } from "@transifex/native";
import { boot } from "lib9c-wasm";

initializeSentry();
boot();

Object.assign(console, electronLog.functions);

_refiner("onShow", () => {
  if (getCurrentWindow().isVisible() && getCurrentWindow().isFocused()) return;
  _refiner("addToResponse", {
    notification: true,
  });
  new Notification(t("We'd welcome your feedback!"), {
    body: t(
      "Let us know how 'Nine Chronicles' can improve your game experience."
    ),
  });
});

DOM.render(<App />, document.getElementById("root"));
