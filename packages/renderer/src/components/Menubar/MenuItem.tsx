import styled from '@emotion/styled';

interface MenuItemProps {
  onClick: () => void;
  icon: string;
  text: string;
  disabled?: boolean;
}

const Item = styled.button({
  display: 'flex',
  alignItems: 'center',
  padding: '4px',
  appearence: 'none',
  cursor: 'pointer',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    outline: 'none',
  },
  '&:disabled': {
    opacity: 0.8,
  },
});

const ItemIcon = styled.img({
  paddingRight: '0.5rem',
});
const ItemText = styled.span({
  fontWeight: '300',
  height: '24px',
  fontSize: '1.1rem',
});

export default function MenuItem({onClick, icon, text, disabled, ...props}: MenuItemProps) {
  return (
    <Item
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <ItemIcon
        src={icon}
      />
      <ItemText>{text}</ItemText>
    </Item>
  );
}
