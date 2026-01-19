import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Card = forwardRef(function Card(
  {
    variant = 'glass',
    padding = 'md',
    className,
    children,
    ...props
  },
  ref
) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    glass: `
      bg-void-elevated
      border border-transparent rounded-2xl
      backdrop-blur-[20px] saturate-[180%]
      shadow-inner-highlight
      [background-image:linear-gradient(#121214,#121214),linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0)_100%)]
      [background-origin:padding-box,border-box]
      [background-clip:padding-box,border-box]
      transition-all duration-200
      hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_30px_-10px_rgba(0,229,153,0.3)]
      hover:-translate-y-0.5
    `,
    solid: `
      bg-void-elevated
      border border-white/[0.08] rounded-xl
      shadow-inner-highlight
    `,
    inset: `
      bg-void-surface
      border border-white/[0.04] rounded-lg
      shadow-inset-depth
    `,
    interactive: `
      bg-void-elevated
      border border-transparent rounded-2xl
      backdrop-blur-[20px]
      [background-image:linear-gradient(#121214,#121214),linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(255,255,255,0))]
      [background-origin:padding-box,border-box]
      [background-clip:padding-box,border-box]
      cursor-pointer
      transition-all duration-200
      hover:shadow-[0_0_40px_-10px_rgba(0,229,153,0.4)]
      hover:-translate-y-1
    `,
    // Legacy compatibility
    default: `
      bg-void-elevated
      border border-white/[0.08] rounded-xl
      shadow-inner-highlight
    `,
    elevated: `
      bg-void-elevated
      border border-white/[0.08] rounded-xl
      shadow-lg
    `,
    ghost: `
      bg-transparent border border-transparent
    `,
  };

  return (
    <div
      ref={ref}
      className={clsx(
        paddingStyles[padding],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  );
});

const CardTitle = forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={clsx(
        'font-display text-xl font-semibold text-text-primary tracking-tight',
        className
      )}
      {...props}
    />
  );
});

const CardDescription = forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={clsx('text-sm text-text-secondary', className)}
      {...props}
    />
  );
});

const CardContent = forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={clsx('', className)} {...props} />;
});

const CardFooter = forwardRef(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx('flex items-center pt-4', className)}
      {...props}
    />
  );
});

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
