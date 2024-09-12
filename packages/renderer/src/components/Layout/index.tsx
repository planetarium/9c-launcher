import styled from '@emotion/styled';

import launcherBackground from '/@/assets/launcher-bg.png';
import ncLogo from '/@/assets/9c-logo.png';
import {TopMenu} from './TopMenu';
import {UserInfo} from './UserInfo';
import {Box} from '../Modal/Modal';
import {GameStartButton} from '../Button/GameStartButton';

const Background = styled.div({
  display: 'flex',
  flexDirection: 'column',
  background: `url(${launcherBackground}) center/cover repeat`,
  padding: '1rem',
  width: '100%',
  height: '100%',
});

const BarContainer = styled.div({
  display: 'flex',
  margin: '1rem',
  justifyContent: 'space-between',
  alignItems: 'center',
  align: 'flex-end',
  gap: '2rem',
});

const MainContainer = styled.div({
  display: 'flex',
  flexGrow: '1',
});

const Logo = styled.img({
  display: 'flex',
  width: '170px',
  justifyContent: 'center',
});

export function Layout() {
  return (
    <Background>
      <BarContainer>
        <Logo src={ncLogo} />
        <TopMenu />
        <UserInfo />
      </BarContainer>
      <MainContainer>
      </MainContainer>
      <BarContainer
        style={{
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <GameStartButton />
      </BarContainer>
    </Background>
  );
}
