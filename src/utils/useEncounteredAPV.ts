import { useApolloClient } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import {
  AppProtocolVersionType,
  DifferentAppProtocolVersionEncounterDocument,
  DifferentAppProtocolVersionEncounterSubscription,
} from "src/generated/graphql";

const TIMEOUT = 1000;
const ENCOUNTERED_PEERS = new Set<string>([]);

// TODO: Generalize this over all subscription types
export function useEncounteredAPV() {
  const client = useApolloClient();
  const lastId = useRef<number | null>(null);
  const [apv, setApv] =
    useState<Pick<AppProtocolVersionType, "version" | "extra">>();

  useEffect(() => {
    let offset = Date.now() + TIMEOUT;
    const subscription = client
      .subscribe<DifferentAppProtocolVersionEncounterSubscription>({
        query: DifferentAppProtocolVersionEncounterDocument,
      })
      .subscribe({
        next(result) {
          if (
            !result.data ||
            !result.data.differentAppProtocolVersionEncounter?.peerVersion
          )
            return;
          const apv =
            result.data.differentAppProtocolVersionEncounter.peerVersion;
          const peer = result.data.differentAppProtocolVersionEncounter.peer;
          if (lastId.current) cancelIdleCallback(lastId.current);
          lastId.current = requestIdleCallback(
            () => {
              offset = Date.now() + TIMEOUT;
              if (ENCOUNTERED_PEERS.has(peer)) return;
              else ENCOUNTERED_PEERS.add(peer);
              setApv(apv);
            },
            { timeout: offset - Date.now() }
          );
        },
        error(error) {
          console.error(error);
        },
      });
    return () => subscription.unsubscribe();
  }, [client]);

  return apv;
}
