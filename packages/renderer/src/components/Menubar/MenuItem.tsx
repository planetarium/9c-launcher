import styled from '@emotion/styled';
import {Button} from '@radix-ui/themes';

interface MenuItemProps {
  icon: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const ItemIcon = styled.img({
  paddingRight: '2px',
});

export function MenuItem({onClick, icon, text, disabled, ...props}: MenuItemProps) {
  return (
    <Button
      style={{
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
        cursor: 'pointer',
        color: 'white',
        fontSize: '1rem',
      }}
      variant="ghost"
      color="gray"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <ItemIcon src={icon} /> {text}
    </Button>
  );
}
