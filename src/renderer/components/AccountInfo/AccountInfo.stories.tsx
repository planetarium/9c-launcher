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

          }
        },
        newData: () => {},
      },
      {
        request: {
          query: StakingSheetDocument
        },
        result: {
          data: {

          }
        },
        newData: () => {},
      },
      {
        request: {
          query: StakingStatusDocument
        },
        result: {
          data: {

          }
        },
        newData: () => {},
      }
    ]
  }
}
