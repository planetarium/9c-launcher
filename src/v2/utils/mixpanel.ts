import { ipcRenderer } from "electron";

export function trackEvent(eventName: string, props?: any) {
  try {
    ipcRenderer.send("mixpanel-track-event", eventName, props);
  } catch (e) {
    console.error("Error tracking event", e);
  }
}
