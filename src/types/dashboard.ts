export type SessionStatus = 'COMPLETED' | 'ENDED';

export interface RecentSession {
  id: string;
  dateLabel: string;
  timeLabel: string;
  duration: string;
  goal: string;
  status: SessionStatus;
}

export interface AdaptiveRecommendation {
  recommendedDurationMinutes: number;
  explanation: string;
  detail: string;
}
