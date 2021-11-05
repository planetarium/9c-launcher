import React from "react";
import { Story, Meta } from "@storybook/react";

import Main from "./main";
import {
  MinerAddressDocument,
  StagedTxDocument,
  CollectionSheetWithStateDocument,
  CollectionStateDocument,
  CollectionStatusDocument,
  GetTipDocument,
} from "../../../generated/graphql";
import { tableSheetData } from "./main.mock";

export default {
  title: "Collection/Pages/Main",
  component: Main,
} as Meta;

const Template: Story = () => <Main signer={address} addressLoading={false} />;
const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";

export const Primary = Template.bind({});
let primaryLevel = 0;
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
      {
        request: {
          query: CollectionStateDocument,
          variables: {
            level: 0,
          },
        },
        result: {
          data: {
            action: {
              cancelCollection:
                "21112b24473d3d4e3cbc141255d62cbba124e8f0be25740429e35d77796d10ca",
              __typename: "ActionMutation",
            },
          },
        },
      },
      {
        request: {
          query: CollectionStatusDocument,
        },
        result: {
          data: {
            monsterCollectionStatus: {
              canReceive: true,
              fungibleAssetValue: {
                quantity: 1000000,
                __typename: "FungibleAssetValueType",
              },
              __typename: "CollectionStatusType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              monsterCollectionStatus: {
                canReceive: true,
                fungibleAssetValue: {
                  quantity: 1000000,
                  __typename: "FungibleAssetValueType",
                },
                __typename: "CollectionStatusType",
              },
            },
          };
        },
      },
      {
        request: {
          query: CollectionStateDocument,
        },
        result: {
          data: {
            monsterCollectionState: {
              address: "",
              expiredBlockIndex: "",
              claimableBlockIndex: 100,
              level: primaryLevel,
              rewardLevel: "",
              receivedBlockIndex: "",
              startedBlockIndex: "",
              __typename: "MonsterCollectionStateType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              monsterCollectionState: {
                address: "",
                end: "",
                expiredBlockIndex: "",
                level: primaryLevel,
                rewardLevel: "",
                receivedBlockIndex: "",
                claimableBlockIndex: 100,
                startedBlockIndex: "",
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
