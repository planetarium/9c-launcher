
import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import "core-js";
import { initializeSentry } from "../preload/sentry";

initializeSentry();

Object.assign(console, electronLog.functions);

DOM.render(<div />, document.getElementById("root"));
