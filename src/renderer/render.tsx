import { app } from "electron";
import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import { initializeSentry } from "../v2/utils/sentry";

import App from "./App";

initializeSentry();

Object.assign(console, electronLog.functions);

if (process.env.NODE_ENV !== "production") {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

DOM.render(<App />, document.getElementById("root"));
