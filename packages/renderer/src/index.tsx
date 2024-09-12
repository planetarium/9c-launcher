import React from 'react';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';
import {createRoot} from 'react-dom/client';
import App from './App';

const theme = extendTheme({
})

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
