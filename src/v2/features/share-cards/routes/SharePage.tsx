/**
 * SharePage - Public share page for workout share cards
 * Phase 38-07
 *
 * Features:
 * - Public route (no auth required)
 * - OpenGraph meta tags for social link previews
 * - Card image at top
 * - Workout details below
 * - RowLab CTA at bottom
 * - Loading and error states
 */

import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useShareCard } from '../hooks/useShareCard';
import { WorkoutDetails } from '../components/WorkoutDetails';
import { motion } from 'framer-motion';
import { FADE_IN_VARIANTS, SPRING_CONFIG } from '../../../utils/animations';

/**
 * Skeleton loader for card image
 */
function CardImageSkeleton({ format }: { format: '1:1' | '9:16' }) {
  const aspectRatio = format === '1:1' ? 'aspect-square' : 'aspect-[9/16]';

  return (
    <div
      className={`w-full ${aspectRatio} rounded-xl bg-bg-surface-elevated/30 border border-bdr-subtle overflow-hidden`}
    >
      <div className="w-full h-full bg-gradient-to-br from-bg-surface-elevated/50 to-bg-surface/50 animate-pulse" />
    </div>
  );
}

/**
 * Error state for expired or not found cards
 */
function CardNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-warning/10 border border-status-warning/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-status-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Share Card Not Found</h1>
        <p className="text-text-secondary mb-6">
          This share card has expired or doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blade-blue text-white rounded-lg hover:bg-blade-blue/90 transition-colors"
        >
          Go to RowLab
        </a>
      </div>
    </div>
  );
}

/**
 * SharePage - Public share page component
 */
export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { data: card, isLoading, error } = useShareCard(shareId!);

  // Handle error states
  if (error || (!isLoading && !card)) {
    return <CardNotFound />;
  }

  // Loading state
  if (isLoading || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <CardImageSkeleton format="1:1" />
          <div className="h-64 bg-bg-surface-elevated/30 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Construct OpenGraph meta data
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://rowlab.net';
  const ogImageUrl = card.url.startsWith('http') ? card.url : `${baseUrl}${card.url}`;
  const ogUrl = `${baseUrl}/share/${shareId}`;
  const ogTitle = card.metadata?.athleteName
    ? `${card.metadata.athleteName} - ${card.metadata.workoutTitle || 'Workout'} | RowLab`
    : 'Workout Share Card | RowLab';
  const ogDescription =
    card.metadata?.description || `Check out this ${card.cardType.replace(/_/g, ' ')} from RowLab`;
  const ogImageHeight = card.format === '1:1' ? '2160' : '3840';

  return (
    <>
      <Helmet>
        {/* Standard meta */}
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />

        {/* OpenGraph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="2160" />
        <meta property="og:image:height" content={ogImageHeight} />
        <meta property="og:url" content={ogUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Card Image */}
          <motion.div
            variants={FADE_IN_VARIANTS}
            initial="hidden"
            animate="visible"
            transition={SPRING_CONFIG}
          >
            <img src={card.url} alt="Workout share card" className="w-full rounded-xl shadow-2xl" />
          </motion.div>

          {/* Workout Details */}
          {card.workoutId && (
            <motion.div
              variants={FADE_IN_VARIANTS}
              initial="hidden"
              animate="visible"
              transition={{ ...SPRING_CONFIG, delay: 0.1 }}
            >
              <WorkoutDetails workoutId={card.workoutId} />
            </motion.div>
          )}

          {/* RowLab CTA */}
          <motion.div
            variants={FADE_IN_VARIANTS}
            initial="hidden"
            animate="visible"
            transition={{ ...SPRING_CONFIG, delay: 0.2 }}
            className="text-center py-8"
          >
            <p className="text-text-secondary mb-4">Track your rowing with RowLab</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blade-blue text-white rounded-lg hover:bg-blade-blue/90 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
}
