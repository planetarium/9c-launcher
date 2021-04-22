import React from "react";
import { Story, Meta } from "@storybook/react";

import Main from "./main";
import {
  CancelStakingDocument,
  MinerAddressDocument,
  StagedTxDocument,
  StakingSheetWithStakingStateDocument,
  StakingStateDocument,
  StakingStatusDocument,
} from "../../../generated/graphql";
import { tableSheetData } from "./main.mock";

export default {
  title: "Staking/Pages/Main",
  component: Main,
} as Meta;

const Template: Story = () => <Main />;
const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";

export const Primary = Template.bind({});
let primaryLevel = 4;
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
          query: StakingSheetWithStakingStateDocument,
          variables: {
            address: address,
          },
        },
        result: () => tableSheetData(primaryLevel),
        newData: () => tableSheetData(primaryLevel),
      },
      {
        request: {
          query: CancelStakingDocument,
          variables: {
            level: 2,
          },
        },
        result: {
          data: {
            action: {
              cancelStaking:
                "21112b24473d3d4e3cbc141255d62cbba124e8f0be25740429e35d77796d10ca",
              __typename: "ActionMutation",
            },
          },
        },
      },
      {
        request: {
          query: StakingStatusDocument,
        },
        result: {
          data: {
            stakingStatus: {
              canReceive: true,
              fungibleAssetValue: {
                quantity: 1000000,
                __typename: "FungibleAssetValueType",
              },
              __typename: "StakingStatusType",
            },
          },
        },
        newData: () => {
          return {
            data: {
              stakingStatus: {
                canReceive: true,
                fungibleAssetValue: {
                  quantity: 1000000,
                  __typename: "FungibleAssetValueType",
                },
                __typename: "StakingStatusType",
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
