import * as React from "react";
import { ipcRenderer } from "electron";
import { useDifferentAppProtocolVersionEncounterSubscription } from "../generated/graphql";

export const DifferentAppProtocolVersionSubscriptionProvider: React.FC = ({
  children,
}) => {
  // FIXME: 구독 로직과 아예 분리할 수 있다면 좋을텐데.
  const {
    loading,
    data,
  } = useDifferentAppProtocolVersionEncounterSubscription();
  React.useEffect(() => {
    console.log(
      "differentAppProtocolVersionEncounterSubscription data: ",
      data
    );
    if (
      !loading &&
      null !== data?.differentAppProtocolVersionEncounter &&
      undefined !== data?.differentAppProtocolVersionEncounter
    ) {
      console.log("encounter different version");
      ipcRenderer.send("encounter different version", data);
    }
  }, [loading, data]);

  return <>{children}</>;
};
