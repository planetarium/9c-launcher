import * as React from "react";
import { ipcRenderer } from "electron";
import { useNotificationSubscription } from "../generated/graphql";

export function NotificationSubscriptionProvider() {
  const { loading, data } = useNotificationSubscription();

  React.useEffect(() => {
    if (!loading) {
      ipcRenderer.send("notification", data);
    }
  }, [loading, data]);

  return <></>;
}
