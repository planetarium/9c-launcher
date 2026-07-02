import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import "core-js/proposals/array-find-from-last";
import "remove-focus-outline";
import App from "./App";
import ErrorBoundary from "./components/core/ErrorBoundary";

import { getCurrentWindow } from "@electron/remote";
import _refiner from "refiner-js";
import { t } from "@transifex/native";

Object.assign(console, electronLog.functions);

// React가 못 잡는 비동기/전역 예외까지 renderer.log에 남긴다.
window.addEventListener("error", (event) => {
  console.error("[window.onerror]", event.error ?? event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("[unhandledrejection]", event.reason);
});

_refiner("onShow", () => {
  if (getCurrentWindow().isVisible() && getCurrentWindow().isFocused()) return;
  _refiner("addToResponse", {
    notification: true,
  });
  new Notification(t("We'd welcome your feedback!"), {
    body: t(
      "Let us know how 'Nine Chronicles' can improve your game experience.",
    ),
  });
});

DOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById("root"),
);
