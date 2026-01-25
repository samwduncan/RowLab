import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Users,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import { useSubscriptionStore } from '../../../../store/subscriptionStore';
import { useToast } from '../../../contexts/ToastContext';
import { UsageBar } from './UsageBar';
import { PlanCard } from './PlanCard';
import { LoadingSkeleton, SkeletonLine } from '../../../components/common/LoadingSkeleton';

/**
 * BillingSection - Subscription and billing management for team owners
 *
 * Features:
 * - Current plan display with status
 * - Usage statistics (athletes, coaches)
 * - Stripe portal integration for billing management
 * - Access restriction for non-owners
 *
 * Uses V1 subscriptionStore for backward compatibility.
 */

interface BillingSectionProps {
  /** Whether the user is a team owner */
  isOwner: boolean;
}

/**
 * Section container with icon and title
 */
interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'violet' | 'green' | 'orange';
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon: Icon,
  accentColor = 'green',
  children,
}) => {
  const colorConfig = {
    violet: {
      bg: 'bg-[var(--color-accent-violet)]/10',
      border: 'border-[var(--color-accent-violet)]/20',
      text: 'text-[var(--color-accent-violet)]',
      glow: 'shadow-[0_0_15px_var(--color-accent-violet-glow)]',
    },
    green: {
      bg: 'bg-[var(--color-status-success)]/10',
      border: 'border-[var(--color-status-success)]/20',
      text: 'text-[var(--color-status-success)]',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)]',
    },
    orange: {
      bg: 'bg-[var(--color-status-warning)]/10',
      border: 'border-[var(--color-status-warning)]/20',
      text: 'text-[var(--color-status-warning)]',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
  };

  const colors = colorConfig[accentColor];

  return (
    <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--color-border-subtle)]">
        <div
          className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.glow}`}
        >
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">{children}</div>
    </div>
  );
};

/**
 * Access restricted message for non-owners
 */
const AccessRestricted: React.FC = () => (
  <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-status-warning)]/20 p-8 text-center">
    <AlertTriangle className="w-12 h-12 text-[var(--color-status-warning)] mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
      Access Restricted
    </h2>
    <p className="text-[var(--color-text-secondary)]">
      Only team owners can manage billing and subscription settings.
      Please contact your team owner to make changes.
    </p>
  </div>
);

/**
 * Loading skeleton for current plan section
 */
const PlanSkeleton: React.FC = () => (
  <LoadingSkeleton>
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-surface)]/30 border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-4">
        <SkeletonLine width={64} height={64} />
        <div>
          <SkeletonLine width={120} height={24} />
          <SkeletonLine width={160} height={16} className="mt-2" />
        </div>
      </div>
      <SkeletonLine width={100} height={36} />
    </div>
  </LoadingSkeleton>
);

/**
 * Loading skeleton for usage section
 */
const UsageSkeleton: React.FC = () => (
  <LoadingSkeleton>
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonLine width="30%" height={16} />
          <SkeletonLine width="15%" height={16} />
        </div>
        <SkeletonLine width="100%" height={8} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonLine width="25%" height={16} />
          <SkeletonLine width="15%" height={16} />
        </div>
        <SkeletonLine width="100%" height={8} />
      </div>
    </div>
  </LoadingSkeleton>
);

export const BillingSection: React.FC<BillingSectionProps> = ({ isOwner }) => {
  const { showToast } = useToast();
  const {
    subscription,
    usage,
    loading,
    fetchSubscription,
    openPortal,
  } = useSubscriptionStore();

  // Fetch subscription data on mount (only for owners)
  useEffect(() => {
    if (isOwner) {
      fetchSubscription();
    }
  }, [isOwner, fetchSubscription]);

  // Handle Stripe portal opening
  const handleManageBilling = async () => {
    const result = await openPortal();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      showToast('error', result.error || 'Failed to open billing portal');
    }
  };

  // Non-owner access restriction
  if (!isOwner) {
    return <AccessRestricted />;
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Section */}
      <Section title="Current Plan" icon={Crown} accentColor="violet">
        {loading && !subscription ? (
          <PlanSkeleton />
        ) : (
          <PlanCard
            planId={subscription?.planId || 'free'}
            status={subscription?.status || ''}
            currentPeriodEnd={subscription?.currentPeriodEnd || null}
            onManageBilling={handleManageBilling}
            loading={loading}
          />
        )}
      </Section>

      {/* Usage Section */}
      <Section title="Usage" icon={BarChart3} accentColor="green">
        {loading && !usage ? (
          <UsageSkeleton />
        ) : (
          <div className="space-y-4">
            <UsageBar
              label="Athletes"
              used={usage?.athletes?.used ?? 0}
              limit={usage?.athletes?.limit ?? 15}
              icon={Users}
            />
            <UsageBar
              label="Coaches"
              used={usage?.coaches?.used ?? 0}
              limit={usage?.coaches?.limit ?? 1}
              icon={UserCog}
            />
          </div>
        )}
      </Section>

      {/* Upgrade Section */}
      <Section title="Upgrade" icon={CreditCard} accentColor="orange">
        <div className="space-y-3">
          <p className="text-[var(--color-text-secondary)]">
            Unlock more features and increase your team capacity.
          </p>
          <Link
            to="/app/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-interactive-primary)] text-[var(--color-bg-primary)] border border-[var(--color-interactive-primary)] hover:shadow-[0_0_20px_var(--color-interactive-primary-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-interactive-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
          >
            View All Plans
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>
    </div>
  );
};

export default BillingSection;
