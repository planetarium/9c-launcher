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
      <div className="justify-center self-center flex-grow">
        <BaseContent>
          <Login />
        </BaseContent>
      </div>
      <BaseNav>
        <BaseNodeInfo />
        <div className="flex gap-2 items-center">
          <GameStartButton />
          <RestartButton />
          <SettingButton />
        </div>
      </BaseNav>
    </BaseBackground>
  );
}
