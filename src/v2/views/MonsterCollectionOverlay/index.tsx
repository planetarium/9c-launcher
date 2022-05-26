import React from "react";
import { observer } from "mobx-react";
import { MonsterCollectionOverlayBase } from "./base";
import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { OverlayProps } from "src/v2/utils/types";

import { useBalance } from "src/v2/utils/useBalance";
import { useStore } from "src/v2/utils/useStore";
import { placeholder, useTx } from "src/v2/utils/useTx";
import {
  useCurrentStakingQuery,
  useStakingSheetQuery,
} from "src/v2/generated/graphql";

function MonsterCollectionOverlay({ isOpen, onClose }: OverlayProps) {
  const account = useStore("account");
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, refetch } = useCurrentStakingQuery({
    variables: { address: account.selectedAddress },
  });
  const balance = useBalance();
  const tx = useTx("stake", placeholder);

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <MonsterCollectionContent
        sheet={sheet}
        current={current}
        currentNCG={balance}
        onChangeAmount={(amount) =>
          tx(amount.toString())
            .catch(console.error)
            .then(() => refetch())
        }
      />
    </MonsterCollectionOverlayBase>
  );
}

export default observer(MonsterCollectionOverlay);
