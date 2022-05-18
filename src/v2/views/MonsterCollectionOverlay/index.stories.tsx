import React from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";

import { MonsterCollectionContent } from ".";
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

export default {
  title: "MonsterCollection/MonsterCollectionContent",
  component: MonsterCollectionContent,
};

function MonsterCollectionOverlay() {
  const { data: sheet } = useStakingSheetQuery();
  const { data: current } = useCurrentStakingQuery();

  if (!sheet || !current) return null;

  return (
    <MonsterCollectionOverlayBase as="main">
      <MonsterCollectionContent sheet={sheet} current={current} />
    </MonsterCollectionOverlayBase>
  );
}

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
                itemId: 191,
                rate: 20,
              },
            ],
          },
          {
            level: 2,
            requiredGold: 100,
            rewards: [
              {
                itemId: 191,
                rate: 20,
              },
            ],
          },
          {
            level: 3,
            requiredGold: 1000,
            rewards: [
              {
                itemId: 191,
                rate: 20,
              },
            ],
          },
        ],
      },
    },
  },
};

export const mocks: [
  MockedResponse<CurrentStakingQuery>,
  MockedResponse<StakingSheetQuery>
] = [
  {
    request: { query: CurrentStakingDocument },
    result: {
      data: {
        stateQuery: {
          stakeState: {
            deposit: 500,
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

export const FirstPage = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MonsterCollectionOverlay />
  </MockedProvider>
);
