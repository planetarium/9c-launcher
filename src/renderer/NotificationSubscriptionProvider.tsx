import { inject, observer } from "mobx-react";
import React, { useEffect } from "react";
import { IStoreContainer } from "src/interfaces/store";
import {
  NotificationEnum,
  useNotificationSubscription,
} from "../generated/graphql";

const NotificationSubscriptionProvider = observer(
  ({ accountStore }: IStoreContainer) => {
    const { loading, data } = useNotificationSubscription();

    useEffect(() => {
      if (!loading && data) {
        const { type, message, receiver } = data.notification;
        let title = "";
        let body = "";

        if (receiver !== accountStore.selectedAddress) {
          return;
        }

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
    }, [loading, data, accountStore.privateKey]);

    return <></>;
  }
);

export default inject("accountStore")(NotificationSubscriptionProvider);
