import React from 'react';
import {Theme, ThemePanel} from '@radix-ui/themes';
import {createRoot} from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Theme
      accentColor="yellow"
      appearance="dark"
      panelBackground="translucent"
    >
      <App />
      <ThemePanel style={{
        '-webkit-app-region': "no-drag"
      }} />
    </Theme>
  </React.StrictMode>,
);
