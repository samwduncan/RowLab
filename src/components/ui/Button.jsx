import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Button = forwardRef(function Button(
  {
    variant = 'glow',
    size = 'md',
    color = 'green',
    loading = false,
    disabled = false,
    className,
    children,
    ...props
  },
  ref
) {
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-200
    disabled:opacity-40 disabled:pointer-events-none
  `;

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const colorMap = {
    green: {
      text: 'text-blade-green',
      glow: 'after:bg-blade-green after:shadow-[0_0_8px_var(--blade-green)]',
      hoverGlow: 'hover:after:shadow-[0_0_12px_var(--blade-green),0_0_24px_rgba(0,229,153,0.4)]',
    },
    violet: {
      text: 'text-coxswain-violet',
      glow: 'after:bg-coxswain-violet after:shadow-[0_0_8px_var(--coxswain-violet)]',
      hoverGlow: 'hover:after:shadow-[0_0_12px_var(--coxswain-violet),0_0_24px_rgba(124,58,237,0.4)]',
    },
  };

  const variantStyles = {
    glow: `
      bg-transparent border-none cursor-pointer
      ${colorMap[color]?.text || colorMap.green.text}
      after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0
      after:h-[2px] after:rounded-[1px]
      ${colorMap[color]?.glow || colorMap.green.glow}
      after:transition-all after:duration-200
      ${colorMap[color]?.hoverGlow || colorMap.green.hoverGlow}
      hover:after:scale-x-105
      active:scale-[0.98]
    `,
    pill: `
      bg-white/[0.06] backdrop-blur-[10px]
      border border-transparent rounded-full
      text-text-primary
      hover:bg-white/[0.1]
      [background-image:linear-gradient(rgba(255,255,255,0.06),rgba(255,255,255,0.06)),linear-gradient(to_bottom,rgba(255,255,255,0.15),rgba(255,255,255,0))]
      [background-origin:padding-box,border-box]
      [background-clip:padding-box,border-box]
    `,
    ghost: `
      bg-transparent border-none cursor-pointer
      text-text-secondary
      hover:text-text-primary
      after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3
      after:h-[1px] after:bg-blade-green
      after:scale-x-0 after:opacity-0
      after:transition-all after:duration-200
      hover:after:scale-x-100 hover:after:opacity-100
    `,
    icon: `
      w-10 h-10 p-0
      bg-white/[0.04] border border-white/[0.08] rounded-[10px]
      text-text-secondary
      hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-text-primary
      active:scale-95
    `,
    // Legacy variants for compatibility
    primary: `
      bg-blade-green text-void-deep font-semibold
      rounded-lg
      hover:bg-[#00ffaa]
      active:scale-[0.98]
      shadow-glow-green hover:shadow-glow-green-lg
    `,
    secondary: `
      bg-white/[0.06] text-text-primary
      border border-white/[0.08] rounded-lg
      hover:bg-white/[0.1] hover:border-white/[0.12]
    `,
    danger: `
      bg-danger-red/20 text-danger-red
      border border-danger-red/30 rounded-lg
      hover:bg-danger-red/30
    `,
    success: `
      bg-blade-green/20 text-blade-green
      border border-blade-green/30 rounded-lg
      hover:bg-blade-green/30
    `,
    outline: `
      bg-transparent text-blade-green
      border border-blade-green rounded-lg
      hover:bg-blade-green/10
    `,
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variant !== 'icon' && sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-blade-green rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
});

export { Button };
export default Button;
