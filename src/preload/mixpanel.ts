import isDev from "electron-is-dev";
import mixpanel from "mixpanel-browser";
import getMAC from "getmac";

const token = "80a1e14b57d050536185c7459d45195a";

export default function initializeMixpanel() {
  if (isDev) {
    console.debug("Mixpanel is disabled in development mode.");
    return;
  }

  if (process.type !== "renderer") {
    console.debug("Mixpanel is disabled in main process.");
    return;
  }

  mixpanel.init(token);
}
