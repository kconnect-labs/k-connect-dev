import React from 'react';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const HeartAnimation = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  '& svg': {
    filter: 'drop-shadow(0 0 5px rgba(224, 187, 255, 0.7))',
    color: 'transparent',
    fill: 'url(#heartGradient)',
  },
  zIndex: 100,
  pointerEvents: 'none',
}));

export default HeartAnimation;
