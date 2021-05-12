import React from 'react';
import { Story, Meta } from '@storybook/react';

import ConfirmationDialog, {Props} from './Dialog';

export default {
  title: 'Staking/ConfirmationDialog',
  component: ConfirmationDialog,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <ConfirmationDialog {...args}/>;


export const Default = Template.bind({});
Default.args = {
  open: true
}
