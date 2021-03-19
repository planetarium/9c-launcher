import { ipcRenderer } from "electron";
import isDev from "electron-is-dev";
import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";
import App from "./App";
import { initializeSentry } from "../preload/sentry";

initializeSentry();

Object.assign(console, electronLog.functions);

if (isDev) {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

const updateOnlineStatus = () => {
   ipcRenderer.send("online-status-changed", navigator.onLine ? "online" : "offline");
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

DOM.render(<App />, document.getElementById("root"));
