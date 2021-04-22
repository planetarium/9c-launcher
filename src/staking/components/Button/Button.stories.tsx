import React from 'react';
import { Story, Meta } from '@storybook/react';

import Button, {Props} from './Button';
import { StakingItemTier, StakingPhase } from '../../../staking/types';

export default {
  title: 'Staking/Button',
  component: Button,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <Button {...args}/>;

export const Primary = Template.bind({});
Primary.args = {
  label: 'OK',
  width: 200,
  height: 50,
  primary: true,
}

export const Cancel = Template.bind({});
Cancel.args = {
  label: 'OK',
  width: 200,
  height: 50,
  primary: false,
}
