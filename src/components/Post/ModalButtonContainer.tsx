import React from 'react';
import { Box, styled } from '@mui/material';

const ButtonContainer = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '12px',
  borderTop: '1px solid rgba(207, 188, 251, 0.2)',
  position: 'sticky',
  bottom: 0,
  marginTop: 'auto',
  [`@media (max-width:600px)`]: {
    padding: '12px',
    flexDirection: 'row',
    gap: '12px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
}));

interface ModalButtonContainerProps {
  children: React.ReactNode;
}

const ModalButtonContainer: React.FC<ModalButtonContainerProps> = ({ children }) => {
  return <ButtonContainer>{children}</ButtonContainer>;
};

export default ModalButtonContainer; 