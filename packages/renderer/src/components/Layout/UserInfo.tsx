import {Icon} from '@chakra-ui/react';

import {MdOutlinePerson, MdOutlineContentCopy} from 'react-icons/md';
import {Menu} from '../Menubar';

export function UserInfo() {
  return (
    <Menu
      style={{
        gap: '0',
      }}
    >
      <Icon
        boxSize={6}
        as={MdOutlinePerson}
      />
      0x3df...512
      <Icon
        boxSize={6}
        as={MdOutlineContentCopy}
      />
    </Menu>
  );
}
