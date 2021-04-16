import React from 'react';
import { Story, Meta } from '@storybook/react';

import Introduce from './introduce';

export default {
  title: 'Staking/Pages/Introduce',
  component: Introduce,
} as Meta;

const Template: Story = () => <Introduce/>;

export const Primary = Template.bind({});
