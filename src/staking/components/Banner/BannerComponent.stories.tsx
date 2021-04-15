import React from 'react';
import { Story, Meta } from '@storybook/react';

import BannerComponent, {Props} from './BannerComponent';

export default {
  title: 'Staking/Banner',
  component: BannerComponent,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

const Template: Story<Props> = (args) => <BannerComponent {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  remaining: '6d',
  progress: 31,
};
