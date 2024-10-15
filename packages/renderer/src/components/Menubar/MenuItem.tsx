import styled from '@emotion/styled';

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
    <button
      className="inline-flex items-center rounded-md hover:bg-gray-500/90 focus:outline-none p-1"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <img
        className="pr-[4px]"
        src={icon}
      />{' '}
      {text}
    </button>
  );
}
