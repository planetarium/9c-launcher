import { MockedProvider } from "@apollo/react-testing";

import './storybook.scss';

const customViewports = {
  kindleFire2: {
    name: 'launcher v2',
    styles: {
      width: '800px',
      height: '600px',
    },
  },
  monsterCollection: {
    name: 'monsterCollection',
    styles: {
      width: '984px',
      height: '560px',
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'fullscreen',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: customViewports
  },
  apolloClient: {
    MockedProvider,
  },
}