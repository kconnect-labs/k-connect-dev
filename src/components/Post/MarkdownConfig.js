import { useTheme } from '@mui/material/styles';
import { linkRenderers } from '../../utils/LinkUtils';
import React from 'react';

// Ленивая загрузка синтаксиса только когда нужен
const SyntaxHighlighter = React.lazy(() =>
  import('react-syntax-highlighter').then(module => ({
    default: module.Prism,
  }))
);
const vscDarkPlus = React.lazy(() =>
  import('react-syntax-highlighter/dist/esm/styles/prism').then(module => ({
    default: module.vscDarkPlus,
  }))
);

export const getMarkdownComponents = () => ({
  ...linkRenderers,
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <React.Suspense fallback={<code>{children}</code>}>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag='div'
          customStyle={{ backgroundColor: 'transparent' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </React.Suspense>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
});
