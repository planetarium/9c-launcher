import React from 'react';
import { Story, Meta } from '@storybook/react';

import Button, {Props} from './Button';

export default {
  title: 'Staking/Button',
  component: Button,
} as Meta;

const Template: Story<Props> = (args) => <Button {...args}/>;

export const Primary = Template.bind({});
Primary.args = {
    width: 300,
    height: 100,
    fontSize: 24,
    label: "Button",
    onClick: () => {},
}