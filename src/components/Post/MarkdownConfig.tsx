import React from 'react';
import { useTheme } from '@mui/material/styles';
import { linkRenderers } from '../../utils/LinkUtils';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const getMarkdownComponents = () => ({
  ...linkRenderers,
  code({ node, inline, className, children, ...props }: CodeProps) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderRadius: 'var(--small-border-radius)',
          padding: '16px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          margin: '8px 0',
        }}
        {...props}
      >
        <code className={className}>
          {String(children).replace(/\n$/, '')}
        </code>
      </pre>
    ) : (
      <code 
        className={className}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
}); 