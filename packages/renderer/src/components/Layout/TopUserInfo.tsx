import {Button} from '@radix-ui/themes';
import {MdOutlinePerson, MdOutlineContentCopy} from 'react-icons/md';
import {Menu} from '../Menubar/Menu';

export function TopUserInfo() {
  return (
    <Menu>
      <Button
        style={{
          color: 'white',
          fontSize: '1.1rem',
        }}
        variant="ghost"
        color="gray"
      >
        <MdOutlinePerson />
        0x3df...512
        <MdOutlineContentCopy />
      </Button>
    </Menu>
  );
}
