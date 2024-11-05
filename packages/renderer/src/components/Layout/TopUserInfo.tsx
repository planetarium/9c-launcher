import {MdOutlinePerson, MdOutlineContentCopy} from 'react-icons/md';
import {Menu} from '../Menubar/Menu';

export function TopUserInfo() {
  return (
    <Menu>
      <button className="inline-flex items-center rounded-md hover:bg-gray-500/90 focus:outline-none p-1">
        <MdOutlinePerson className="w-5 h-5 me-1" />
        0x3df...512
        <MdOutlineContentCopy className="w-5 h-5 ms-1" />
      </button>
    </Menu>
  );
}
