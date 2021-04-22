import React from 'react';
import { Story, Meta } from '@storybook/react';

import Landing, {Props} from './landing';

export default {
  title: 'Staking/Pages/Landing',
  component: Landing,
} as Meta;

const Template: Story<Props> = (props: Props) => <Landing {...props}/>;

export const Primary = Template.bind({});
