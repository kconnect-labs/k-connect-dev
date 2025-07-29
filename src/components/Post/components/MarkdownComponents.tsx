import React from 'react';

export const createMarkdownComponents = (linkRenderers: any, vscDarkPlus: any, SyntaxHighlighter: any) => ({
  ...linkRenderers,
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{
          backgroundColor: 'transparent',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
}); 