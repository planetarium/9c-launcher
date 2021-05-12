import React from 'react';
import { Story, Meta } from '@storybook/react';

import RemainingDisplay, {Props} from './RemainingDisplay';

export default {
  title: 'Staking/RemainingDisplay',
  component: RemainingDisplay,
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<Props> = (args) => <RemainingDisplay {...args}/>;


export const Default = Template.bind({});
Default.args = {
  remainMin: 10000
}
