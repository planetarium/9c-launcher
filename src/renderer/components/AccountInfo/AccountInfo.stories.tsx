import React from 'react';
import { Story, Meta } from '@storybook/react';

import AccountInfoContainer, { Props } from './AccountInfoContainer';
import { Provider } from 'mobx-react';
import AccountStore from '../../stores/account';
import { GoldAndStakingLevelDocument, StakingSheetDocument, StakingStatusDocument } from '../../../generated/graphql';

export default {
  title: 'Renderer/Components/AccountInfo',
  component: AccountInfoContainer,
} as Meta;


const accountStore = new AccountStore()

const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";
accountStore.addAddress(address);
accountStore.setSelectedAddress(address);

const Template: Story<Props> = (props) => <Provider accountStore={accountStore}>
  <AccountInfoContainer {...props}/>
  </Provider>;

export const Primary = Template.bind({});
Primary.args = {
  onOpenWindow: () => {},
  onReward: () => {},
  minedBlock: 500
}
Primary.parameters = {
  apolloClient: {
    mocks: [
      {
        request: {
          query: GoldAndStakingLevelDocument,
          variables: {
            address: address,
          },
        },
        result: {
          data: {
            stateQuery: {
              agent: {
                gold: "102720",
                stakingLevel: 3,
                __typename: "AgentStateType"
              },
              __typename: "StateQuery"
            }
          },
        },
        newData: () => {
          return {
          data: {
            stateQuery: {
              agent: {
                gold: "102720",
                stakingLevel: 3,
                __typename: "AgentStateType"
              },
              __typename: "StateQuery"
            }
          },
          }
        },
      },
      {
        request: {
          query: StakingSheetDocument
        },
        result: {
          data: {
            stateQuery: {
              stakingSheet: {
                orderedList: [
                  {
                    level: 1,
                    requiredGold: 500,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 2,
                    requiredGold: 1800,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 3,
                    requiredGold: 7200,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 4,
                    requiredGold: 54000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 5,
                    requiredGold: 270000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 6,
                    requiredGold: 480000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 7,
                    requiredGold: 3000000,
                    __typename: "StakingRowType"
                  }
                ],
                __typename: "StakingSheetType"
              },
              __typename: "StateQuery"
            }
          }
        },
        newData: () => {return {
          data: {
            stateQuery: {
              stakingSheet: {
                orderedList: [
                  {
                    level: 1,
                    requiredGold: 500,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 2,
                    requiredGold: 1800,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 3,
                    requiredGold: 7200,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 4,
                    requiredGold: 54000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 5,
                    requiredGold: 270000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 6,
                    requiredGold: 480000,
                    __typename: "StakingRowType"
                  },
                  {
                    level: 7,
                    requiredGold: 3000000,
                    __typename: "StakingRowType"
                  }
                ],
                __typename: "StakingSheetType"
              },
              __typename: "StateQuery"
            }
          }
        }},
      },
      {
        request: {
          query: StakingStatusDocument
        },
        result: {
          data: {
            stakingStatus: {
              canReceive: true,
              __typename: "StakingStatusType",
              fungibleAssetValue: {
                quantity: 102740,
                __typename: "FungibleAssetValueType"
              }
            }
          },
        },
        newData: () => {return {
          data: {
            stakingStatus: {
              canReceive: true,
              __typename: "StakingStatusType",
              fungibleAssetValue: {
                quantity: 102740,
                __typename: "FungibleAssetValueType"
              }
            }
          }
        }},
      }
    ]
  }
}
