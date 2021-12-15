import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import "remove-focus-outline";
import { initializeSentry } from "../preload/sentry";
import App from "./App";

initializeSentry();

Object.assign(console, electronLog.functions);

DOM.render(<App />, document.getElementById("root"));
