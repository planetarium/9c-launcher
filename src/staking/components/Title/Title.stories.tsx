import React from 'react';
import { Story, Meta } from '@storybook/react';

import Title from './Title';

export default {
  title: 'Staking/Title',
  component: Title,
} as Meta;

const Template: Story = (args) => <Title/>;

export const Primary = Template.bind({});
