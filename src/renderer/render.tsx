import * as DOM from "react-dom";
import React from "react";
import App from "./App";
import { initializeSentry } from "../preload/sentry";
import electronLog from "electron-log";

import * as Sentry from "@sentry/electron";
import isDev from "electron-is-dev";

initializeSentry();

Object.assign(console, electronLog.functions);

if (isDev) {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

DOM.render(<App />, document.getElementById("root"));
