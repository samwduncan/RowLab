/**
 * Loading Fallback Component
 *
 * Displays a skeleton loader while lazy-loaded components are being fetched.
 * Uses the design system tokens for consistency.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingFallbackProps {
  variant?: 'page' | 'component' | 'minimal';
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  variant = 'page',
  message = 'Loading...',
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          className="w-6 h-6 border-2 border-blade-blue border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (variant === 'component') {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-20 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  // Full page loading
  return (
    <div className="min-h-screen bg-void-deep flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated logo/spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blade-blue/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blade-blue border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-coxswain-violet/20"
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-coxswain-violet border-b-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Loading text */}
        <motion.p
          className="text-lg font-medium text-text-secondary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>

        {/* Skeleton preview */}
        <div className="mt-8 space-y-3 max-w-md mx-auto px-4">
          <div className="h-3 bg-white/10 rounded animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-3/5 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Skeleton components for different UI elements
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-card p-4 animate-pulse ${className}`}>
    <div className="space-y-3">
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="h-8 bg-white/10 rounded" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="glass-card p-4 animate-pulse">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-white/10">
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-4 bg-white/10 rounded w-1/4" />
        <div className="h-4 bg-white/10 rounded w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="glass-card p-4 animate-pulse">
    <div className="h-6 bg-white/10 rounded w-1/4 mb-4" />
    <div className="h-64 bg-white/10 rounded" />
  </div>
);

export default LoadingFallback;
