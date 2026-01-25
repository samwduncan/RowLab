import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Standard breakpoints matching design system
 * Mobile: 0 - 767px
 * Tablet: 768px - 1023px
 * Desktop: 1024px+
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Hook to detect current breakpoint
 * Returns 'mobile' | 'tablet' | 'desktop'
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

/**
 * Hook to check if current viewport is mobile
 */
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
};

/**
 * Hook to check if current viewport is tablet or smaller
 */
export const useIsTabletOrSmaller = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile' || breakpoint === 'tablet';
};

/**
 * Hook to get if we should show mobile layout
 * (mobile navigation, simplified layouts)
 */
export const useShowMobileLayout = (): boolean => {
  return useIsMobile();
};
