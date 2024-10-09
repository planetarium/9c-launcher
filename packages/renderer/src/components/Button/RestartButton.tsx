import {IconButton} from '@radix-ui/themes';
import {MdRefresh} from 'react-icons/md';

export function RestartButton() {
  return (
    <IconButton
      size="4"
      variant="ghost"
    >
      <MdRefresh size='1.5rem' />
    </IconButton>
  );
}
