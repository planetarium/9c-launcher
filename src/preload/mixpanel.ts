import isDev from "electron-is-dev";
import mixpanel from "mixpanel-browser";
import { electronStore } from "../config";

const token = "80a1e14b57d050536185c7459d45195a";

export default function initializeMixpanel() {
  if (process.type !== "renderer") {
    console.debug("Mixpanel is disabled in main process.");
    return;
  }

  mixpanel.init(token);
  if (isDev || electronStore.get("Mixpanel") !== true) {
    console.debug("Mixpanel is disabled.");
    mixpanel.disable();
  }
}
