import React from 'react';
import { Story, Meta } from '@storybook/react';

import Landing from './landing';

export default {
  title: 'Staking/Pages/Landing',
  component: Landing,
} as Meta;

const Template: Story = () => <Landing/>;

export const Primary = Template.bind({});
