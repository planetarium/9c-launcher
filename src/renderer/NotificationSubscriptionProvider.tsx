import * as React from "react";
import { useNotificationSubscription } from "../generated/graphql";

enum NotificationEnum {
  Refill = "REFILL",
}

export function NotificationSubscriptionProvider() {
  const { loading, data } = useNotificationSubscription();

  React.useEffect(() => {
    if (!loading && data) {
      let { type } = data.notification;
      let title = "";
      let body = "";

      if (type === NotificationEnum.Refill) {
        title = "You can refill action point!";
        body = "Turn on Nine Chronicles!";
      }

      if (title && body) {
        new Notification(title, { body: body });
      }
    }
  }, [loading, data]);

  return <></>;
}
