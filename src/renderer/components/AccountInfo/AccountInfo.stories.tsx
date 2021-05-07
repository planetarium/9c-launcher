import React from 'react';
import { Story, Meta } from '@storybook/react';

import AccountInfoContainer from './AccountInfoContainer';
import { Provider } from 'mobx-react';
import { IStoreContainer } from '../../../interfaces/store';
import AccountStore from '../../stores/account';
import { RouterStore } from 'mobx-react-router';
import GameStore from '../../stores/game';
import StandaloneStore from '../../stores/standaloneStore';
import { GoldAndStakingLevelDocument, StakingSheetDocument, StakingStatusDocument } from '../../../generated/graphql';

export default {
  title: 'Renderer/Components/AccountInfo',
  component: AccountInfoContainer,
} as Meta;

const store: IStoreContainer = {
  accountStore: new AccountStore(),
  routerStore: null,
  gameStore: null,
  standaloneStore: null,
}

const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";
store.accountStore.addAddress(address);
store.accountStore.setSelectedAddress(address);

const Template: Story = () => <Provider {...store}>
  <AccountInfoContainer onOpenWindow={() => {}} onReward={()=>{}}/>
  </Provider>;

export const Primary = Template.bind({});
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
