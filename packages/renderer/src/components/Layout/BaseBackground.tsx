import styled from '@emotion/styled';
import launcherBackground from '@/assets/launcher-bg.png';

export const BaseBackground = styled.div({
  '-webkit-app-region': 'drag',
  display: 'flex',
  flexDirection: 'column',
  background: `url(${launcherBackground}) center/cover repeat`,
  width: '100vw',
  height: '100vh',
  '& > * > *': {
    '-webkit-app-region': 'no-drag',
  },
});
