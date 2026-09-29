import type { AdaptiveRecommendation, RecentSession } from '../types/dashboard';

export const overviewMetrics = [
  { label: 'Total focus time', value: '8h 42m', detail: 'This month' },
  { label: 'Completed sessions', value: '18', detail: 'This month' },
  { label: 'Interruptions', value: '6', detail: 'Across 18 sessions' },
] as const;

export const recentSessions: RecentSession[] = [
  { id: 'session-1', dateLabel: 'Today', timeLabel: '09:20', duration: '32 min', goal: 'Outline the Q3 research brief', status: 'COMPLETED' },
  { id: 'session-2', dateLabel: 'Yesterday', timeLabel: '14:05', duration: '25 min', goal: 'Review product interview notes', status: 'COMPLETED' },
  { id: 'session-3', dateLabel: 'Monday', timeLabel: '10:40', duration: '18 min', goal: 'Plan the week ahead', status: 'ENDED' },
];

export const adaptiveRecommendation: AdaptiveRecommendation = {
  recommendedDurationMinutes: 30,
  explanation: 'You usually settle into a steady rhythm around 25–30 minutes.',
  detail: 'Try 30 minutes today. You can change this before starting.',
};
