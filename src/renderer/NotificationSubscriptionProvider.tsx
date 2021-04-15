import React, { useEffect } from "react";
import {
  NotificationEnum,
  useNotificationSubscription,
} from "../generated/graphql";

export function NotificationSubscriptionProvider() {
  const { loading, data } = useNotificationSubscription();

  useEffect(() => {
    if (!loading && data) {
      const { type, message } = data.notification;
      let title = "";
      let body = "";

      if (type === NotificationEnum.Refill) {
        title = "You can refill action point!";
        body = "Turn on Nine Chronicles!";
      }

      if (type === NotificationEnum.Has) {
        if (message) {
          //stage id.
          title = `Start Stage #${message}`;
          body = "Turn on Nine Chronicles!";
        }
      }

      if (type === NotificationEnum.Buyer) {
        title = "Buy Item";
        body = "Turn on Nine Chronicles!";
      }

      if (type === NotificationEnum.Seller) {
        title = "Sell Item";
        body = "Turn on Nine Chronicles!";
      }

      if (type === NotificationEnum.CombinationConsumable) {
        title = "Start Combination Consumable";
        body = "Turn on Nine Chronicles!";
      }

      if (type === NotificationEnum.CombinationEquipment) {
        title = "Start Combination Equipment";
        body = "Turn on Nine Chronicles!";
      }

      if (title && body) {
        new Notification(title, { body: body });
      }
    }
  }, [loading, data]);

  return <></>;
}
