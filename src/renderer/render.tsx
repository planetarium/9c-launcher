import * as Sentry from "@sentry/electron";
import isDev from "electron-is-dev";
import electronLog from "electron-log";
import mixpanel from "mixpanel-browser";
import React from "react";
import * as DOM from "react-dom";

import { initializeSentry } from "../preload/sentry";
import initializeMixpanel from "../preload/mixpanel";

import App from "./App";


initializeSentry();
initializeMixpanel();

Sentry.configureScope((scope) => {
  const distinctId = mixpanel.get_distinct_id();
  scope.setUser({ id: distinctId });
  const mixpanelProfileUrl =
    "https://mixpanel.com/report/2176897/view/337143/profile";
  scope.setExtra(
    "mixpanel_url",
    `${mixpanelProfileUrl}#distinct_id=${distinctId}`
  );
});

Object.assign(console, electronLog.functions);

if (isDev) {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

DOM.render(<App />, document.getElementById("root"));
