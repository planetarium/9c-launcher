import * as DOM from "react-dom";
import React from "react";
import App from "./App";
import { initializeSentry } from "../preload/sentry";
import initializeMixpanel from "../preload/mixpanel";
import electronLog from "electron-log";
import mixpanel from "mixpanel-browser";
import * as Sentry from "@sentry/electron";

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

DOM.render(<App />, document.getElementById("root"));
