import {IconButton} from '@radix-ui/themes';
import {MdOutlineSettings} from 'react-icons/md';

export function SettingButton() {
  return (
    <IconButton
      size="4"
      variant="ghost"
    >
      <MdOutlineSettings size="1.5rem" />
    </IconButton>
  );
}
