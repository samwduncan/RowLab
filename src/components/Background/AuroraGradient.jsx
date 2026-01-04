import { useEffect, useRef, useState } from 'react';

/**
 * Aurora Waters WebGL Gradient Background
 *
 * Uses Stripe-style animated mesh gradient with ocean blue + shimmer colors.
 * Falls back to CSS gradient if WebGL is not supported.
 */

// Dynamically import stripe-gradient to handle CommonJS module
let GradientClass = null;

// Check WebGL support
const hasWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
})();

// CSS Fallback gradient
const CSSGradientFallback = () => (
  <div
    className="fixed inset-0 -z-10 bg-aurora-mesh"
    style={{
      background: `
        radial-gradient(ellipse 100% 60% at 10% 30%, rgba(0, 217, 255, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 80% 50% at 90% 20%, rgba(167, 139, 250, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 50% 80%, rgba(244, 114, 182, 0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 30% at 70% 60%, rgba(252, 211, 77, 0.04) 0%, transparent 60%),
        #020D13
      `,
      backgroundAttachment: 'fixed',
    }}
  />
);

/**
 * Main Aurora Gradient Component
 *
 * @param {Object} props
 * @param {string} props.variant - Color variant: 'ocean' (default), 'shimmer', 'aurora'
 * @param {boolean} props.fixed - Whether gradient is fixed position (default: true)
 */
export const AuroraGradient = ({ variant = 'ocean', fixed = true }) => {
  const canvasRef = useRef(null);
  const gradientRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Color presets for different variants
  const colorPresets = {
    ocean: {
      color1: '#020D13', // Ocean deep
      color2: '#00D9FF', // Shimmer cyan
      color3: '#041C26', // Ocean base
      color4: '#A78BFA', // Shimmer purple
    },
    shimmer: {
      color1: '#00D9FF', // Shimmer cyan
      color2: '#A78BFA', // Shimmer purple
      color3: '#F472B6', // Shimmer pink
      color4: '#020D13', // Ocean deep
    },
    aurora: {
      color1: '#020D13', // Ocean deep
      color2: '#00D9FF', // Shimmer cyan
      color3: '#A78BFA', // Shimmer purple
      color4: '#F472B6', // Shimmer pink
    },
  };

  useEffect(() => {
    if (!hasWebGL || !canvasRef.current) {
      setIsReady(true);
      return;
    }

    // Initialize gradient
    const colors = colorPresets[variant] || colorPresets.ocean;

    // Set CSS custom properties for gradient colors
    const canvas = canvasRef.current;
    canvas.style.setProperty('--gradient-color-1', colors.color1);
    canvas.style.setProperty('--gradient-color-2', colors.color2);
    canvas.style.setProperty('--gradient-color-3', colors.color3);
    canvas.style.setProperty('--gradient-color-4', colors.color4);

    // Dynamically import and initialize Stripe gradient
    const initGradient = async () => {
      try {
        if (!GradientClass) {
          const module = await import('stripe-gradient');
          GradientClass = module.Gradient || module.default?.Gradient || module.default;
        }

        if (GradientClass && canvasRef.current) {
          gradientRef.current = new GradientClass();
          gradientRef.current.initGradient('#aurora-gradient-canvas');
        }
        setIsReady(true);
      } catch (error) {
        console.warn('WebGL gradient initialization failed, using CSS fallback:', error);
        setIsReady(true);
      }
    };

    initGradient();

    return () => {
      // Cleanup
      if (gradientRef.current) {
        try {
          gradientRef.current.disconnect?.();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [variant]);

  // Use CSS fallback if WebGL not available
  if (!hasWebGL) {
    return <CSSGradientFallback />;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        id="aurora-gradient-canvas"
        data-transition-in
        className={`${fixed ? 'fixed' : 'absolute'} inset-0 -z-10 w-full h-full`}
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          '--gradient-color-1': colorPresets[variant]?.color1 || '#020D13',
          '--gradient-color-2': colorPresets[variant]?.color2 || '#00D9FF',
          '--gradient-color-3': colorPresets[variant]?.color3 || '#041C26',
          '--gradient-color-4': colorPresets[variant]?.color4 || '#A78BFA',
        }}
      />
      {/* Fallback while loading */}
      {!isReady && <CSSGradientFallback />}
    </>
  );
};

/**
 * Lightweight CSS-only aurora background
 * For areas where WebGL is overkill
 */
export const AuroraMesh = ({ className = '' }) => (
  <div
    className={`absolute inset-0 -z-10 ${className}`}
    style={{
      background: `
        radial-gradient(ellipse 100% 60% at 10% 30%, rgba(0, 217, 255, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 80% 50% at 90% 20%, rgba(167, 139, 250, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 50% 80%, rgba(244, 114, 182, 0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 30% at 70% 60%, rgba(252, 211, 77, 0.04) 0%, transparent 60%),
        var(--ocean-deep, #020D13)
      `,
    }}
  />
);

export default AuroraGradient;
