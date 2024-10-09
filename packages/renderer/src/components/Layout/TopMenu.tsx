import {Menu} from '../Menubar/Menu';
import {MenuItem} from '../Menubar/MenuItem';

import WNCG from '/@/assets/WNCG.svg';
import gold from '/@/assets/gold.png';

export function TopMenu() {
  return (
    <Menu>
      <MenuItem
        icon={WNCG}
        text="WNCG Staking"
        onClick={() => {}}
      />
      <MenuItem
        icon={gold}
        text="Send NCG"
        onClick={() => {}}
      />
    </Menu>
  );
}
