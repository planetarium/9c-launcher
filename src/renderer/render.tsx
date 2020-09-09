import * as DOM from "react-dom";
import React from "react";
import electronLog from "electron-log";
import App from "./App";
import initializeSentry from "../preload/sentry";
import initializeMixpanel from "../preload/mixpanel";

initializeSentry();
initializeMixpanel();

Object.assign(console, electronLog.functions);

DOM.render(<App />, document.getElementById("root"));
