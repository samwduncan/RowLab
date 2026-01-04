import { motion } from 'framer-motion';

// ============================================
// Custom Boat Icon
// Rowing shell silhouette without transparency overlap
// ============================================

interface BoatIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function BoatIcon({
  size = 64,
  className = '',
  animated = false
}: BoatIconProps) {
  const iconContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Water waves - background */}
      <path
        d="M4 44c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0 8-2 12 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
      <path
        d="M8 50c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.2"
      />

      {/* Rowing shell hull - solid shape to avoid overlap issues */}
      <path
        d="M8 36c0 0 2 4 24 4s24-4 24-4l-4 6c0 0-4 2-20 2s-20-2-20-2l-4-6z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M8 36c0 0 2 4 24 4s24-4 24-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Riggers - simplified to avoid overlap */}
      <g strokeWidth="1.5" stroke="currentColor" strokeLinecap="round">
        {/* Left rigger */}
        <line x1="20" y1="36" x2="14" y2="28" />
        <line x1="14" y1="28" x2="8" y2="28" />

        {/* Right rigger */}
        <line x1="44" y1="36" x2="50" y2="28" />
        <line x1="50" y1="28" x2="56" y2="28" />
      </g>

      {/* Oars */}
      <g strokeWidth="2" stroke="currentColor" strokeLinecap="round">
        {/* Left oar */}
        <line x1="8" y1="28" x2="4" y2="20" />
        <ellipse cx="3" cy="18" rx="2" ry="4" fill="currentColor" fillOpacity="0.5" transform="rotate(-30 3 18)" />

        {/* Right oar */}
        <line x1="56" y1="28" x2="60" y2="20" />
        <ellipse cx="61" cy="18" rx="2" ry="4" fill="currentColor" fillOpacity="0.5" transform="rotate(30 61 18)" />
      </g>

      {/* Rower silhouette - single solid shape */}
      <ellipse
        cx="32"
        cy="32"
        rx="4"
        ry="3"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle
        cx="32"
        cy="26"
        r="3"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {iconContent}
      </motion.div>
    );
  }

  return iconContent;
}
