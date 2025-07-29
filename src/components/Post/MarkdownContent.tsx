import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

interface MarkdownContentProps {
  isExpanded?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

const MarkdownContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'isExpanded',
})<MarkdownContentProps>(({ theme, isExpanded }) => ({
  '& p': {
    margin: theme.spacing(0.5, 0),
    lineHeight: 1.2,
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& ul, & ol': {
    marginLeft: theme.spacing(2),
    lineHeight: 1,
  },
  '& li': {
    lineHeight: 1,
  },
  '& code': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(0, 0.6),
    borderRadius: 3,
    fontSize: '0.85rem',
  },
  '& pre': {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(50px))',
    WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(50px))',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  maxHeight: isExpanded ? 'none' : '450px',
  overflow: isExpanded ? 'visible' : 'hidden',
  position: 'relative',
  transition: 'max-height 0.3s ease',
}));

export default MarkdownContent; 