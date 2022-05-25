import React, { ComponentPropsWithRef } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";

import { MonsterCollectionContent } from "./MonsterCollectionContent";
import { MonsterCollectionOverlayBase } from "./base";

import {
  CurrentStakingDocument,
  CurrentStakingQuery,
  StakingSheetDocument,
  StakingSheetQuery,
  useCurrentStakingQuery,
  useStakingSheetQuery,
} from "src/v2/generated/graphql";

import "normalize.css";
import "core-js/proposals/array-find-from-last";

const result = {
  data: {
    stateQuery: {
      stakeRegularRewardSheet: {
        orderedList: [
          // FIXME Change the value to something realistic
          {
            level: 1,
            requiredGold: 10,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
              },
            ],
          },
          {
            level: 2,
            requiredGold: 100,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
              },
            ],
          },
          {
            level: 3,
            requiredGold: 1000,
            rewards: [
              {
                itemId: 10121000,
                rate: 20,
              },
            ],
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

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase as="main">
      <MonsterCollectionContent
        sheet={sheet}
        current={current}
        currentNCG={500}
        {...props}
        onChangeAmount={async (amount) => {
          await props.onChangeAmount?.(amount);
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
        }}
      />
    </MonsterCollectionOverlayBase>
  );
}

export const FirstPage = (args: Args) => <MonsterCollectionOverlay {...args} />;

export const EditPage = (args: Args) => (
  <MonsterCollectionOverlay isEditing {...args} />
);
