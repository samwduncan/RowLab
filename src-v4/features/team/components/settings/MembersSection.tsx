/**
 * Members management section.
 *
 * Shows member list with role badges and role-based actions:
 * - Admin: promote/demote/remove any member (except last admin)
 * - Coach: promote athletes to coach, remove athletes
 * - Athlete: read-only roster view
 *
 * Uses useUpdateMemberRole and useRemoveMember from useTeamMutations.
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Crown, UserMinus, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/useAuth';
import { teamRosterOptions } from '../../api';
import { useUpdateMemberRole, useRemoveMember } from '../../hooks/useTeamMutations';
import { isAdmin, isCoachOrAbove, ROLE_DISPLAY } from '../../types';
import type { TeamDetail } from '../../types';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MembersSectionProps {
  team: TeamDetail;
}

export function MembersSection({ team }: MembersSectionProps) {
  const { user } = useAuth();
  const { data: members = [] } = useQuery(teamRosterOptions(team.id));

  const roleMutation = useUpdateMemberRole(team.id);
  const removeMutation = useRemoveMember(team.id);

  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const myRole = team.role;
  const amAdmin = isAdmin(myRole);
  const amCoachOrAbove = isCoachOrAbove(myRole);

  // Count admins for "last admin" protection
  const adminCount = members.filter((m) => m.role === 'OWNER').length;

  const handleRoleChange = useCallback(
    (userId: string, newRole: string) => {
      roleMutation.mutate({ userId, role: newRole });
    },
    [roleMutation]
  );

  const handleRemove = useCallback(
    (userId: string) => {
      removeMutation.mutate(userId, {
        onSuccess: () => setRemovingUserId(null),
      });
    },
    [removeMutation]
  );

  // Sort: OWNER > COACH > ATHLETE, alpha within group
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder: Record<string, number> = { OWNER: 0, COACH: 1, ATHLETE: 2 };
    const orderDiff = (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-secondary">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {sortedMembers.map((member) => {
          const isMe = member.userId === user?.id;
          const memberIsAdmin = isAdmin(member.role);
          const memberIsCoach = member.role === 'COACH';
          const isLastAdmin = memberIsAdmin && adminCount <= 1;

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-xl bg-ink-raised/50 border border-ink-border px-4 py-3"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-well text-xs font-semibold text-ink-muted uppercase">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-primary truncate">
                    {member.name}
                    {isMe && <span className="ml-1 text-xs text-ink-muted font-normal">(you)</span>}
                  </span>
                  <RoleBadge role={member.role} />
                </div>
                <span className="text-xs text-ink-muted truncate block">{member.email}</span>
              </div>

              {/* Actions */}
              {!isMe && amCoachOrAbove && removingUserId !== member.userId && (
                <div className="flex items-center gap-1">
                  {/* Promote */}
                  {amAdmin && !memberIsAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleChange(member.userId, memberIsCoach ? 'OWNER' : 'COACH')
                      }
                      disabled={roleMutation.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-data-good hover:bg-data-good/10 transition-colors disabled:opacity-50"
                      title={memberIsCoach ? 'Promote to Admin' : 'Promote to Coach'}
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}
                  {!amAdmin && isCoachOrAbove(myRole) && member.role === 'ATHLETE' && (
                    <button
                      type="button"
                      onClick={() => handleRoleChange(member.userId, 'COACH')}
                      disabled={roleMutation.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-data-good hover:bg-data-good/10 transition-colors disabled:opacity-50"
                      title="Promote to Coach"
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}

                  {/* Demote */}
                  {amAdmin && memberIsAdmin && !isLastAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRoleChange(member.userId, 'COACH')}
                      disabled={roleMutation.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-ink-secondary hover:bg-ink-hover transition-colors disabled:opacity-50"
                      title="Demote to Coach"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                  {amAdmin && memberIsCoach && (
                    <button
                      type="button"
                      onClick={() => handleRoleChange(member.userId, 'ATHLETE')}
                      disabled={roleMutation.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-ink-secondary hover:bg-ink-hover transition-colors disabled:opacity-50"
                      title="Demote to Athlete"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}

                  {/* Remove */}
                  {(amAdmin || (amCoachOrAbove && member.role === 'ATHLETE')) && (
                    <button
                      type="button"
                      onClick={() => setRemovingUserId(member.userId)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:text-data-poor hover:bg-data-poor/10 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Remove confirmation */}
              {removingUserId === member.userId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-data-poor">Remove?</span>
                  <Button size="sm" variant="ghost" onClick={() => setRemovingUserId(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="!bg-data-poor hover:!bg-data-poor/90"
                    loading={removeMutation.isPending}
                    onClick={() => handleRemove(member.userId)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Last admin warning */}
      {amAdmin && adminCount <= 1 && (
        <p className="text-xs text-ink-muted mt-1">
          You are the only admin. Promote another member to admin before leaving or being demoted.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

const DEFAULT_ROLE_CONFIG = { icon: Users, color: 'text-ink-secondary bg-ink-border/50' };

const ROLE_CONFIG: Record<string, { icon: typeof Crown; color: string }> = {
  OWNER: { icon: Crown, color: 'text-accent-copper bg-accent-copper/10' },
  COACH: { icon: Shield, color: 'text-data-info bg-data-info/10' },
  ATHLETE: DEFAULT_ROLE_CONFIG,
};

function RoleBadge({ role }: { role: string }) {
  const { icon: Icon, color } = ROLE_CONFIG[role] ?? DEFAULT_ROLE_CONFIG;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${color}`}
    >
      <Icon size={10} />
      {ROLE_DISPLAY[role] ?? role}
    </span>
  );
}
