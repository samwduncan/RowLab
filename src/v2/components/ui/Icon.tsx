import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Standard icon sizes used across V2
 * sm: 16px - inline text, small buttons
 * md: 20px - default, nav items, form inputs
 * lg: 24px - section headers, large buttons
 * xl: 32px - empty states, hero sections
 */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',    // 16px
  md: 'w-5 h-5',    // 20px
  lg: 'w-6 h-6',    // 24px
  xl: 'w-8 h-8',    // 32px
};

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  /**
   * Accessible label for screen readers
   * Required for standalone icons (not next to text)
   */
  label?: string;
}

/**
 * Standardized Icon wrapper component
 * Ensures consistent sizing across V2
 *
 * Usage:
 * <Icon icon={Home} size="md" />
 * <Icon icon={Settings} size="lg" label="Settings" />
 */
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  className,
  label,
}) => {
  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      aria-hidden={!label}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
};

/**
 * Icon with badge (e.g., notification count)
 */
interface IconWithBadgeProps extends IconProps {
  badge?: number | string;
  badgeColor?: 'primary' | 'error' | 'success';
}

export const IconWithBadge: React.FC<IconWithBadgeProps> = ({
  badge,
  badgeColor = 'primary',
  ...iconProps
}) => {
  const badgeColors = {
    primary: 'bg-interactive-primary text-white',
    error: 'bg-status-error text-white',
    success: 'bg-status-success text-white',
  };

  return (
    <div className="relative inline-flex">
      <Icon {...iconProps} />
      {badge !== undefined && (
        <span
          className={cn(
            'absolute -top-1 -right-1 min-w-[16px] h-4 px-1',
            'text-xs font-medium flex items-center justify-center rounded-full',
            badgeColors[badgeColor]
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

/**
 * Standard icon button sizes matching Icon sizes
 * Use with IconButton component
 */
export const iconButtonSizes = {
  sm: 'w-8 h-8',    // 32px container for 16px icon
  md: 'w-10 h-10',  // 40px container for 20px icon
  lg: 'w-12 h-12',  // 48px container for 24px icon
  xl: 'w-14 h-14',  // 56px container for 32px icon
};
