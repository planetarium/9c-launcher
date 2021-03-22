import { ipcRenderer, remote } from "electron";
import isDev from "electron-is-dev";
import electronLog from "electron-log";
import React from "react";
import * as DOM from "react-dom";

import { Renderer } from "../interfaces/i18n";
import { initializeSentry } from "../preload/sentry";

import App from "./App";
import { useLocale } from "./i18n";

const { locale } = useLocale<Renderer>("renderer");

initializeSentry();

Object.assign(console, electronLog.functions);

if (isDev) {
  const mobxDevTools = document.createElement("script");
  mobxDevTools.setAttribute("src", "//localhost:8098");
  document.head.appendChild(mobxDevTools);
}

const updateOnlineStatus = () => {
  ipcRenderer.send("online-status-changed", navigator.onLine ? "online" : "offline");

  if (!navigator.onLine) {
    window.alert(locale("인터넷 연결이 끊겼습니다. 인터넷 연결 상태를 확인한 후에 다시 시도해주십시오."));
    remote.app.relaunch();
    remote.app.exit();
  }
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

DOM.render(<App />, document.getElementById("root"));
