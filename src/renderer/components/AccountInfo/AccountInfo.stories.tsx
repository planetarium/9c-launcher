import React from 'react';
import { Story, Meta } from '@storybook/react';

import AccountInfoContainer, { Props } from './AccountInfoContainer';
import { Provider } from 'mobx-react';
import AccountStore from '../../stores/account';
import { CollectionSheetDocument, CollectionStatusDocument, CollectionStateDocument, NodeStatusSubscriptionDocument } from '../../../generated/graphql';

export default {
  title: 'Renderer/Components/AccountInfo',
  component: AccountInfoContainer,
} as Meta;


const accountStore = new AccountStore()

const address = "0x590c887BDac8d957Ca5d3c1770489Cf2aFBd868E";
accountStore.addAddress(address);
accountStore.setSelectedAddress(address);

const Template: Story<Props> = (props) => <Provider accountStore={accountStore}>
  <AccountInfoContainer {...props} />
</Provider>;

export const Primary = Template.bind({});
Primary.args = {
  onOpenWindow: () => { },
  onReward: () => { },
  minedBlock: 500
}
Primary.parameters = {
  apolloClient: {
    mocks: [
      {
        request: {
          query: CollectionSheetDocument
        },
        result: {
          data: {
            stateQuery: {
              collectionSheet: {
                orderedList: [
                  {
                    level: 1,
                    requiredGold: 500,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 2,
                    requiredGold: 1800,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 3,
                    requiredGold: 7200,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 4,
                    requiredGold: 54000,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 5,
                    requiredGold: 270000,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 6,
                    requiredGold: 480000,
                    __typename: "CollectionRowType"
                  },
                  {
                    level: 7,
                    requiredGold: 3000000,
                    __typename: "CollectionRowType"
                  }
                ],
                __typename: "CollectionSheetType"
              },
              __typename: "StateQuery"
            }
          }
        },
        newData: () => {
          return {
            data: {
              stateQuery: {
                collectionSheet: {
                  orderedList: [
                    {
                      level: 1,
                      requiredGold: 500,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 2,
                      requiredGold: 1800,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 3,
                      requiredGold: 7200,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 4,
                      requiredGold: 54000,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 5,
                      requiredGold: 270000,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 6,
                      requiredGold: 480000,
                      __typename: "CollectionRowType"
                    },
                    {
                      level: 7,
                      requiredGold: 3000000,
                      __typename: "CollectionRowType"
                    }
                  ],
                  __typename: "CollectionSheetType"
                },
                __typename: "StateQuery"
              }
            }
          }
        },
      },
      {
        request: {
          query: CollectionStateDocument
        },
        result: {
          data: {
            stateQuery: {
              agent: {
                gold: "102720",
                collectionLevel: 3,
                __typename: "AgentStateType"
              },
              __typename: "StateQuery"
            },
            monsterCollectionState: {
              address: "",
              end: "",
              expiredBlockIndex: "",
              claimableBlockIndex: 100,
              level: 4,
              rewardLevel: "",
              receivedBlockIndex: "",
              startedBlockIndex: "",
              __typename: "MonsterCollectionStateType"
            },
          },
        },
        newData: () => {
          return {
            data: {
              stateQuery: {
                agent: {
                  gold: "102720",
                  collectionLevel: 3,
                  __typename: "AgentStateType"
                },
                __typename: "StateQuery"
              },
              monsterCollectionState: {
                address: "",
                end: "",
                expiredBlockIndex: "",
                claimableBlockIndex: 100,
                level: 4,
                rewardLevel: "",
                receivedBlockIndex: "",
                startedBlockIndex: "",
                __typename: "MonsterCollectionStateType"
              },
            },
          }
        }
      },
      {
        request: {
          query: NodeStatusSubscriptionDocument
        },
        result: {
          data: {
            nodeStatus: {
              bootstrapEnded: true,
              preloadEnded: true,
              __typename: "NodeStatusType"
            }
          }
        },
        newData: () => {
          return {
            data: {
              nodeStatus: {
                bootstrapEnded: true,
                preloadEnded: true,
                __typename: "NodeStatusType"
              }
            }
          }
        }
      },
      {
        request: {
          query: CollectionStatusDocument
        },
        result: {
          data: {
            collectionStatus: {
              canReceive: true,
              __typename: "CollectionStatusType",
              fungibleAssetValue: {
                quantity: 102740,
                __typename: "FungibleAssetValueType"
              }
            }
          },
        },
        newData: () => {
          return {
            data: {
              collectionStatus: {
                canReceive: true,
                __typename: "CollectionStatusType",
                fungibleAssetValue: {
                  quantity: 102740,
                  __typename: "FungibleAssetValueType"
                }
              }
            }
          }
        },
      }
    ]
  }
}
