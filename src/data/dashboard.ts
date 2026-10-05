import type { AdaptiveRecommendation, RecentSession } from '../types/dashboard';

export const overviewMetrics = [
  {
    id: 'focus-time',
    label: 'Total Focus Time',
    value: '2h 45m',
    change: '↑ 12%',
    tone: 'positive',
    icon: 'clock',
  },
  {
    id: 'completed-sessions',
    label: 'Completed Sessions',
    value: '4',
    change: '↑ 33%',
    tone: 'positive',
    icon: 'completed',
  },
  {
    id: 'interruptions',
    label: 'Interruptions',
    value: '2',
    change: '↓ 20%',
    tone: 'negative',
    icon: 'interruptions',
  },
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
