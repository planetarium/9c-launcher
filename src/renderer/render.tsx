import * as DOM from "react-dom";
import * as React from "react";
import App from "./App";
import { initializeSentry } from "../preload/sentry";
import initializeMixpanel from "../preload/mixpanel";
import electronLog from "electron-log";

initializeSentry();
initializeMixpanel();

Object.assign(console, electronLog.functions);

DOM.render(<App />, document.getElementById("root"));
