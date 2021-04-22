const totalGold = 1000000;
const getCurrentGold = (level: number) => {
  switch (level) {
    case 0:
      return totalGold;
    case 1:
      return totalGold - 500;
    case 2:
      return totalGold - 2300;
    case 3:
      return totalGold - 9500;
    case 4:
      return totalGold - 64500;
    case 5:
      return totalGold - 333500;
    case 6:
      return totalGold - 813500;
    case 7:
      return totalGold - 3813500;
  }
};

export const tableSheetData = (level: number) => {
return {
  data: {
    stateQuery: {
      stakingSheet: {
        orderedList: [
          {
            level: 1,
            requiredGold: 500,
            rewards: [
              {
                itemId: 400000,
                quantity: 200,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 2,
            requiredGold: 1800,
            rewards: [
              {
                itemId: 400000,
                quantity: 880,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 3,
            requiredGold: 7200,
            rewards: [
              {
                itemId: 400000,
                quantity: 600,
                __typename: "StakingRewardInfoType",
              },
              {
                itemId: 500000,
                quantity: 2,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 4,
            requiredGold: 54000,
            rewards: [
              {
                itemId: 400000,
                quantity: 13000,
                __typename: "StakingRewardInfoType",
              },
              {
                itemId: 500000,
                quantity: 10,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 5,
            requiredGold: 270000,
            rewards: [
              {
                itemId: 400000,
                quantity: 70000,
                __typename: "StakingRewardInfoType",
              },
              {
                itemId: 500000,
                quantity: 50,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 6,
            requiredGold: 480000,
            rewards: [
              {
                itemId: 400000,
                quantity: 150000,
                __typename: "StakingRewardInfoType",
              },
              {
                itemId: 500000,
                quantity: 80,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
          {
            level: 7,
            requiredGold: 3000000,
            rewards: [
              {
                itemId: 400000,
                quantity: 1000000,
                __typename: "StakingRewardInfoType",
              },
              {
                itemId: 500000,
                quantity: 500,
                __typename: "StakingRewardInfoType",
              },
            ],
            __typename: "StakingRowType",
          },
        ],
        __typename: "StakingSheetType",
      },
      agent: {
        gold: String(getCurrentGold(level)),
        stakingLevel: level,
        stakingRound: 0,
        __typename: "AgentStateType",
      },
      __typename: "StateQuery",
    },
  },
};
} 
