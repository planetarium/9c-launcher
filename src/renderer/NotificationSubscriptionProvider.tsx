import React, { useEffect } from "react";
import { useNotificationSubscription } from "../generated/graphql";

enum NotificationEnum {
  Refill = "REFILL",
}

export default function NotificationSubscriptionProvider() {
  const { loading, data } = useNotificationSubscription();

  useEffect(() => {
    if (!loading && data) {
      const { type } = data.notification;
      let title = "";
      let body = "";

      if (type === NotificationEnum.Refill) {
        title = "You can refill action point!";
        body = "Turn on Nine Chronicles!";
      }

      if (title && body) {
        // eslint-disable-next-line no-new
        new Notification(title, { body });
      }
    }
  }, [loading, data]);

  return <></>;
}
