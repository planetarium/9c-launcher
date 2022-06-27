import React from "react";
import { Story, Meta } from "@storybook/react";

import Main from "./main";
import {
  MinerAddressDocument,
  StagedTxDocument,
  CollectionSheetWithStateDocument,
  GetTipDocument,
  CollectionStatusByAgentDocument,
  CollectionStateByAgentDocument,
} from "../../../generated/graphql";
import { tableSheetData } from "./main.mock";

export default {
  title: "Collection/Pages/Main",
  component: Main,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
} as Meta;

const Template: Story = () => <Main signer={address} addressLoading={false} />;
const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";

export const Primary = Template.bind({});
const primaryLevel = 0;
Primary.parameters = {
  apolloClient: {
    mocks: [
      {
        request: {
          query: MinerAddressDocument,
        },
        result: {
          data: {
            minerAddress: address,
          },
        },
      },
      {
        request: {
          query: CollectionSheetWithStateDocument,
          variables: {
            address: address,
          },
        },
        result: () => tableSheetData(primaryLevel),
        newData: () => tableSheetData(primaryLevel),
      },
      // {
      //   request: {
      //     query: CollectionStateDocument,
      //     variables: {
      //       level: 0,
      //     },
      //   },
      //   result: {
      //     data: {
      //       action: {
      //         cancelCollection:
      //           "21112b24473d3d4e3cbc141255d62cbba124e8f0be25740429e35d77796d10ca",
      //         __typename: "ActionMutation",
      //       },
      //     },
      //   },
      // },
      {
        request: {
          query: CollectionStatusByAgentDocument,
          variables: { address },
        },
        result: {
          data: {
            monsterCollectionStatusByAgent: {
              lockup: true,
              fungibleAssetValue: {
                quantity: 1000000,
                currency: "NCG",
                __typename: "FungibleAssetValueType",
              },
              rewardInfos: [
                {
                  itemId: 0,
                  quantity: 0,
                  __typename: "MonsterCollectionRewardInfoType",
                },
              ],
              tipIndex: 0,
              __typename: "CollectionStatusType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              monsterCollectionStatusByAgent: {
                lockup: true,
                fungibleAssetValue: {
                  quantity: 1000000,
                  currency: "NCG",
                  __typename: "FungibleAssetValueType",
                },
                rewardInfos: [
                  {
                    itemId: 0,
                    quantity: 0,
                    __typename: "MonsterCollectionRewardInfoType",
                  },
                ],
                tipIndex: 0,
                __typename: "CollectionStatusType",
              },
            },
          };
        },
      },
      {
        request: {
          query: CollectionStateByAgentDocument,
          variables: { address },
        },
        result: {
          data: {
            monsterCollectionStateByAgent: {
              address,
              expiredBlockIndex: 10,
              claimableBlockIndex: 100,
              level: primaryLevel,
              rewardLevel: 10,
              receivedBlockIndex: 100,
              startedBlockIndex: 10,
              __typename: "MonsterCollectionStateType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              monsterCollectionStateByAgent: {
                address,
                expiredBlockIndex: 10,
                claimableBlockIndex: 100,
                level: primaryLevel,
                rewardLevel: 10,
                receivedBlockIndex: 100,
                startedBlockIndex: 10,
                __typename: "MonsterCollectionStateType",
              },
            },
          };
        },
      },
      {
        request: {
          query: GetTipDocument,
        },
        result: {
          data: {
            nodeStatus: {
              tip: {
                index: 100,
                __typename: "TipType",
              },
              __typename: "NodeStatusType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              nodeStatus: {
                tip: {
                  index: 100,
                  __typename: "TipType",
                },
                __typename: "NodeStatusType",
              },
            },
          };
        },
      },
      {
        request: {
          query: StagedTxDocument,
          variables: {
            address: address,
          },
        },
        result: {
          data: {
            nodeStatus: {
              stagedTxIds: [
                "21112b24473d3d4e3cbc141255d62cbba124e8f0be25740429e35d77796d10ca",
              ],
              __typename: "NodeStatusType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              nodeStatus: {
                stagedTxIds: [],
                __typename: "NodeStatusType",
              },
            },
          };
        },
      },
    ],
  },
};
