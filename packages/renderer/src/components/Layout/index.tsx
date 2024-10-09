import {Flex} from '@radix-ui/themes';
import {BaseBackground} from './BaseBackground';
import {BaseNav} from './BaseNav';
import {BaseLogo} from './BaseLogo';
import {BaseNodeInfo} from './BaseNodeInfo';
import {TopMenu} from './TopMenu';
import {TopUserInfo} from './TopUserInfo';
import {GameStartButton} from '../Button/GameStartButton';
import {RestartButton} from '../Button/RestartButton';
import {SettingButton} from '../Button/SettingButton';

import {BaseContent} from '../Content/BaseContent';
import {Login} from '../Content/Login';

export function Layout() {
  return (
    <BaseBackground>
      <BaseNav>
        <BaseLogo />
        <TopMenu />
        <TopUserInfo />
      </BaseNav>
      <Flex
        justify="center"
        align="center"
        flexGrow="1"
      >
        <BaseContent>
          <Login />
        </BaseContent>
      </Flex>
      <BaseNav>
        <BaseNodeInfo />
        <Flex
          gap="2rem"
          align="center"
        >
          <GameStartButton />
          <RestartButton />
          <SettingButton />
        </Flex>
      </BaseNav>
    </BaseBackground>
  );
}
