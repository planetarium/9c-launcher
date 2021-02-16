import * as DOM from "react-dom";
import React from "react";
import App from "./App";
import { initializeSentry } from "../preload/sentry";
import { mixpanelBrowser } from "../preload/mixpanel";
import electronLog from "electron-log";

import * as Sentry from "@sentry/electron";
import isDev from "electron-is-dev";

initializeSentry();

Sentry.configureScope((scope) => {
  const distinctId = mixpanelBrowser.get_distinct_id();
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
