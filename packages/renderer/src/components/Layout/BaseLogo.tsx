import styled from '@emotion/styled';
import ncLogo from "/@/assets/9c-logo.png"

export const BaseLogo = styled.img({
  display: 'flex',
  width: '170px',
  justifyContent: 'center',
  content: `url(${ncLogo})`,
});
