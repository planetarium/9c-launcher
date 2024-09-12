import {Container} from '@chakra-ui/react';
import styled from '@emotion/styled';

export const Box = styled.div({
  '-webkit-app-region': 'no-drag',
  color: 'white',
  background: '#1F2023B3',
  backdropFilter: 'blur(10px)',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
});

export function Modal() {
  return <Box></Box>;
}
