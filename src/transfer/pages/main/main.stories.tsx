import React from 'react';
import { Story, Meta } from '@storybook/react';

import MainPage, {Props} from './main';
import { ITransferStoreContainer, StoreContext } from 'src/transfer/hooks';
import MockedHeadlessStore from 'src/transfer/stores/mockHeadless';
import MenuStore from 'src/transfer/stores/views/menu';
import TransferPageStore from 'src/transfer/stores/views/transfer';

export default {
  title: 'Transfer/Pages/Main',
  component: MainPage,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const storeContainer: ITransferStoreContainer = {
    headlessStore: new MockedHeadlessStore(),
    menuStore: new MenuStore(),
    transferPage: new TransferPageStore(),
}

const Template: Story<Props> = (props: Props) => <StoreContext.Provider value={storeContainer}> <MainPage {...props}/> </StoreContext.Provider>;


export const Default = Template.bind({});
Default.args = {
}
