import React, { ComponentPropsWithRef, useState } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { noop } from "lodash";

import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { MonsterCollectionOverlayBase } from "./base";

import {
  CurrentStakingDocument,
  CurrentStakingQuery,
  StakeRewardType,
  StakingSheetDocument,
  StakingSheetQuery,
  useCurrentStakingQuery,
  useStakingSheetQuery,
} from "src/generated/graphql";

const result = {
  data: {
    stateQuery: {
      stakeRewards: {
        orderedList: [
          // FIXME Change the value to something realistic
          {
            level: 1,
            requiredGold: 10,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
                type: StakeRewardType.Item,
              },
            ],
            bonusRewards: [],
          },
          {
            level: 2,
            requiredGold: 100,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
                type: StakeRewardType.Item,
              },
            ],
            bonusRewards: [],
          },
          {
            level: 3,
            requiredGold: 1000,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
                type: StakeRewardType.Item,
              },
            ],
            bonusRewards: [],
          },
        ],
      },
    },
  },
};

const mocks: [
  MockedResponse<CurrentStakingQuery>,
  MockedResponse<StakingSheetQuery>
] = [
  {
    request: { query: CurrentStakingDocument },
    result: {
      data: {
        stateQuery: {
          stakeState: {
            deposit: "500",
            cancellableBlockIndex: 0,
            claimableBlockIndex: 50400,
            receivedBlockIndex: 0,
            startedBlockIndex: 0,
          },
        },
      },
    },
  },
  {
    request: { query: StakingSheetDocument },
    newData() {
      return result;
    },
    result,
  },
];

export default {
  title: "MonsterCollection/MonsterCollectionContent",
  component: MonsterCollectionContent,
  parameters: {
    apolloClient: { MockedProvider, mocks },
  },
  args: {
    currentNCG: 500,
  },
};

interface Args {
  currentNCG?: number;
}

function MonsterCollectionOverlay(
  props: Partial<ComponentPropsWithRef<typeof MonsterCollectionContent>> & Args
) {
  const { data: sheet } = useStakingSheetQuery();
  const { data: current, client } = useCurrentStakingQuery();
  const [loading, setLoading] = useState(false);

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase as="main">
      <MonsterCollectionContent
        sheet={sheet}
        current={current}
        currentNCG={500}
        isLoading={loading}
        onClose={noop}
        tip={100}
        {...props}
        onChangeAmount={async (amount) => {
          setLoading(true);
          await props.onChangeAmount?.(amount);
          await new Promise((res) => setTimeout(res, 1000));
          client.writeQuery({
            query: CurrentStakingDocument,
            data: {
              stateQuery: {
                stakeState: {
                  ...current.stateQuery.stakeState,
                  deposit: amount.toString(),
                },
              },
            },
          });
          setLoading(false);
        }}
      />
    </MonsterCollectionOverlayBase>
  );
}

export const FirstPage = (args: Args) => <MonsterCollectionOverlay {...args} />;

export const EditPage = (args: Args) => (
  <MonsterCollectionOverlay isEditing {...args} />
);
