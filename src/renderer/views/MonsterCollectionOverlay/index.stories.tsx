import React, { ComponentPropsWithRef, useState } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";

import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { MonsterCollectionOverlayBase } from "./base";

import {
  UserStakingDocument,
  UserStakingQuery,
  StakeRewardType,
  LatestStakingSheetDocument,
  LatestStakingSheetQuery,
  useUserStakingQuery,
  useLatestStakingSheetQuery,
} from "src/generated/graphql";

const mocks: [
  MockedResponse<UserStakingQuery>,
  MockedResponse<LatestStakingSheetQuery>,
] = [
  {
    request: { query: UserStakingDocument },
    result: {
      data: {
        stateQuery: {
          stakeState: {
            deposit: "5000",
            cancellableBlockIndex: 0,
            claimableBlockIndex: 50400,
            receivedBlockIndex: 0,
            startedBlockIndex: 0,
            stakeRewards: {
              orderedList: [
                {
                  level: 1,
                  requiredGold: 50,
                  rewards: [
                    {
                      itemId: 400000,
                      decimalRate: 10,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 500000,
                      decimalRate: 800,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 20001,
                      decimalRate: 6000,
                      type: StakeRewardType.Rune,
                      currencyTicker: "",
                    },
                  ],
                  bonusRewards: [
                    {
                      itemId: 500000,
                      count: 1,
                    },
                  ],
                },
                {
                  level: 2,
                  requiredGold: 500,
                  rewards: [
                    {
                      itemId: 400000,
                      decimalRate: 4,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 500000,
                      decimalRate: 600,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 20001,
                      decimalRate: 6000,
                      type: StakeRewardType.Rune,
                      currencyTicker: "",
                    },
                    {
                      itemId: 0,
                      decimalRate: 0.1,
                      type: StakeRewardType.Currency,
                      currencyTicker: "CRYSTAL",
                    },
                  ],
                  bonusRewards: [
                    {
                      itemId: 500000,
                      count: 2,
                    },
                  ],
                },
                {
                  level: 3,
                  requiredGold: 5000,
                  rewards: [
                    {
                      itemId: 400000,
                      decimalRate: 2,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 500000,
                      decimalRate: 400,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 20001,
                      decimalRate: 6000,
                      type: StakeRewardType.Rune,
                      currencyTicker: "",
                    },
                    {
                      itemId: 0,
                      decimalRate: 0.1,
                      type: StakeRewardType.Currency,
                      currencyTicker: "CRYSTAL",
                    },
                  ],
                  bonusRewards: [
                    {
                      itemId: 500000,
                      count: 2,
                    },
                  ],
                },
                {
                  level: 4,
                  requiredGold: 50000,
                  rewards: [
                    {
                      itemId: 400000,
                      decimalRate: 2,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 500000,
                      decimalRate: 400,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 20001,
                      decimalRate: 6000,
                      type: StakeRewardType.Rune,
                      currencyTicker: "",
                    },
                    {
                      itemId: 0,
                      decimalRate: 0.1,
                      type: StakeRewardType.Currency,
                      currencyTicker: "CRYSTAL",
                    },
                  ],
                  bonusRewards: [
                    {
                      itemId: 500000,
                      count: 2,
                    },
                  ],
                },
                {
                  level: 5,
                  requiredGold: 500000,
                  rewards: [
                    {
                      itemId: 400000,
                      decimalRate: 1,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 500000,
                      decimalRate: 200,
                      type: StakeRewardType.Item,
                      currencyTicker: "",
                    },
                    {
                      itemId: 20001,
                      decimalRate: 3000,
                      type: StakeRewardType.Rune,
                      currencyTicker: "",
                    },
                    {
                      itemId: 0,
                      decimalRate: 0.05,
                      type: StakeRewardType.Currency,
                      currencyTicker: "CRYSTAL",
                    },
                  ],
                  bonusRewards: [
                    {
                      itemId: 500000,
                      count: 2,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    request: { query: LatestStakingSheetDocument },
    result: {
      data: {
        stateQuery: {
          latestStakeRewards: {
            orderedList: [
              {
                level: 1,
                requiredGold: 50,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 10,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 800,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 6000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 1,
                  },
                ],
              },
              {
                level: 2,
                requiredGold: 500,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 4,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 600,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 6000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.1,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
              {
                level: 3,
                requiredGold: 5000,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 2,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 400,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 6000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.1,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
              {
                level: 4,
                requiredGold: 50000,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 2,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 400,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 6000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.1,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
              {
                level: 5,
                requiredGold: 500000,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 1,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 200,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 3000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.05,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
              {
                level: 6,
                requiredGold: 5000000,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 1,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 200,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 3000,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 800201,
                    decimalRate: 100,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.05,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
              {
                level: 7,
                requiredGold: 10000000,
                rewards: [
                  {
                    itemId: 400000,
                    decimalRate: 0.4,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 500000,
                    decimalRate: 80,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 20001,
                    decimalRate: 1200,
                    type: StakeRewardType.Rune,
                    currencyTicker: "",
                  },
                  {
                    itemId: 600201,
                    decimalRate: 50,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 800201,
                    decimalRate: 50,
                    type: StakeRewardType.Item,
                    currencyTicker: "",
                  },
                  {
                    itemId: 0,
                    decimalRate: 100,
                    type: StakeRewardType.Currency,
                    currencyTicker: "GARAGE",
                  },
                  {
                    itemId: 0,
                    decimalRate: 0.01,
                    type: StakeRewardType.Currency,
                    currencyTicker: "CRYSTAL",
                  },
                ],
                bonusRewards: [
                  {
                    itemId: 500000,
                    count: 2,
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
];

export default {
  title: "MonsterCollection/MonsterCollectionContent",
  component: MonsterCollectionContent,
  parameters: {
    apolloClient: { MockedProvider, mocks },
  },
  args: {
    currentNCG: 50000000,
  },
};

interface Args {
  currentNCG?: number;
}

function MonsterCollectionOverlay(
  props: Partial<ComponentPropsWithRef<typeof MonsterCollectionContent>> & Args,
) {
  const { data: sheet } = useLatestStakingSheetQuery();
  const { data: current, client } = useUserStakingQuery();
  const [loading, setLoading] = useState(false);

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase as="main">
      <MonsterCollectionContent
        latestSheet={sheet}
        current={current}
        currentNCG={500000000}
        isLoading={loading}
        onClose={() => {}}
        tip={100}
        {...props}
        onStake={async (amount) => {
          setLoading(true);
          await props.onStake?.(amount);
          await new Promise((res) => setTimeout(res, 1000));
          client.writeQuery({
            query: UserStakingDocument,
            data: {
              stateQuery: {
                stakeState: {
                  ...current.stateQuery.stakeState,
                  deposit: amount.toString(),
                  stakeRewards: sheet.stateQuery.latestStakeRewards,
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
