import {Layout} from '@/components/Layout/index';
import {ThemeProvider} from '@/components/theme-provider';
import '../styles/global.scss';

export default function App() {
  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <Layout />
    </ThemeProvider>
  );
}
