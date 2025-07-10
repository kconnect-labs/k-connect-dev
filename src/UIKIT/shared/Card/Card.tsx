import styles from './Card.module.css';


function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`${styles.Base} ${className} border-default`} {...props} />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`${styles.Header} ${className}  `} {...props} />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`${styles.Description} ${className}`} {...props} />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`${styles.Title} ${className}`} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`${styles.Content} ${className}`} {...props} />
  );
}

interface CardFooterProps extends React.ComponentProps<'div'> {
  className?: string
  variant?: FooterVariant
}

enum FooterVariant {
  left = 'left',
  center = 'center',
  right = 'right'
}

function CardFooter({
	className = '',
	variant = FooterVariant.left,
	...props
}: CardFooterProps) {
	return <div className={`${styles.Footer} ${styles[variant]} ${className} `} {...props} />
}

export {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent, 
  CardFooter
}
