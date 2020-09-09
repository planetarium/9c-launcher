import { useEffect } from "react";
import {
  useNotificationSubscription,
  NotificationEnum,
} from "../generated/graphql";

export default function useNotification() {
  const { loading, data } = useNotificationSubscription();

  useEffect(() => {
    if (!loading && data) {
      const { type } = data.notification;

      if (type === NotificationEnum.Refill) {
        const title = "You can refill action point!";
        const body = "Turn on Nine Chronicles!";

        new Notification(title, { body });
      }
    }
  }, [loading, data]);
}
