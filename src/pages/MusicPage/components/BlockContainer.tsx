import React from 'react';
import styles from './BlockContainer.module.css';

function BlockContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={`${styles.container} ${
        className || ''
      } border rounded-md bg-blur .shadow-md pointer transition `}
      {...props}
    ></div>
  );
}

function BlockContainerContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={`${styles.content} ${
        className || ''
      } flex items-center gap-12`}
      {...props}
    ></div>
  );
}

function BlockContainerIcon({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={`${styles.icon} ${className || ''}`} {...props}></div>;
}

interface MusicTypeContainerProps extends React.ComponentProps<'div'> {
  className?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function MusicTypeContainer({
  className,
  title,
  description,
  icon,
  onClick,
  ...props
}: MusicTypeContainerProps) {
  return (
    <BlockContainer onClick={onClick}>
      <BlockContainerContent>
        <BlockContainerIcon>{icon}</BlockContainerIcon>
        <div>
          <h6 className='font-bold text-lg'>{title}</h6>
          <p className='text-sm' style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {description}
          </p>
        </div>
      </BlockContainerContent>
    </BlockContainer>
  );
}

export {
  BlockContainer,
  BlockContainerContent,
  BlockContainerIcon,
  MusicTypeContainer,
};
