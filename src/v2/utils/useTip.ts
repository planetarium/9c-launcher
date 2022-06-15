import { useApolloClient } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { TipDocument, TipSubscription } from "../generated/graphql";

export function useTip() {
  const client = useApolloClient();
  const lastId = useRef<number | null>(null);
  const [tip, setTip] = useState<number>(0);

  useEffect(() => {
    const subscription = client
      .subscribe<TipSubscription>({
        query: TipDocument,
      })
      .subscribe({
        next(result) {
          if (!result.data || !result.data.tipChanged) return;
          const tip = result.data.tipChanged.index;
          if (lastId.current) cancelIdleCallback(lastId.current);
          lastId.current = requestIdleCallback(() => setTip(tip));
        },
        error(error) {
          console.error(error);
        },
      });
    return () => subscription.unsubscribe();
  }, [client]);

  return tip;
}
