import React from 'react';
import { Story, Meta } from '@storybook/react';

import Intro from './Intro';

export default {
  title: 'Staking/Pages/Intro',
  component: Intro,
} as Meta;

const Template: Story = () => <Intro/>;

export const Primary = Template.bind({});
