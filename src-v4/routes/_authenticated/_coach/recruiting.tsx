/**
 * Recruiting route: /recruiting (coach-only via _coach layout guard).
 */
import { createFileRoute } from '@tanstack/react-router';
import { RecruitingPage } from '@/features/coach/recruiting/components/RecruitingPage';

export const Route = createFileRoute('/_authenticated/_coach/recruiting')({
  component: RecruitingPage,
});
