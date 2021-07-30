import isDev from "electron-is-dev";
import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import { initializeSentry } from "../preload/sentry";

import App from "./App";

initializeSentry();

Object.assign(console, electronLog.functions);

if (isDev) {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

DOM.render(<App />, document.getElementById("root"));
