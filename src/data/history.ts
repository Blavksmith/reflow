export type HistoryStatus = "COMPLETED" | "INTERRUPTED" | "ABANDONED";

export type HistoryIcon =
  | "target"
  | "file"
  | "lightbulb"
  | "book"
  | "monitor"
  | "list";

export interface TimelineSegment {
  /** Portion of the planned duration this segment represents (0–1). */
  portion: number;
  /** Visual tone of the segment. */
  tone: "focus" | "pause" | "idle";
}

export interface RecoveryAction {
  time: string;
  title: string;
  icon: "flag" | "rescue" | "break";
}

export interface HistorySession {
  id: string;
  /** ISO-like date used for grouping, e.g. "2026-10-03". */
  dateKey: string;
  /** Friendly date shown in the row, e.g. "Oct 3, 2026". */
  dateLabel: string;
  /** 24h start time, e.g. "09:30". */
  timeLabel: string;
  /** End time, e.g. "09:55". */
  endTimeLabel: string;
  goal: string;
  description: string;
  /** Planned duration in minutes. */
  plannedMinutes: number;
  /** Actual focus time in minutes. */
  focusMinutes: number;
  status: HistoryStatus;
  interruptionCount: number;
  icon: HistoryIcon;
  timeline: TimelineSegment[];
  recoveryActions: RecoveryAction[];
}

export interface HistoryGroup {
  key: string;
  /** Label shown above the group, e.g. "Today", "Yesterday", or a date. */
  label: string;
  dateLabel: string;
  sessions: HistorySession[];
}

export const historySessions: HistorySession[] = [
  {
    id: "h-1",
    dateKey: "2026-10-03",
    dateLabel: "Oct 3, 2026",
    timeLabel: "09:30",
    endTimeLabel: "09:55",
    goal: "Finish the design system documentation",
    description: "Worked on component documentation and guidelines.",
    plannedMinutes: 25,
    focusMinutes: 23,
    status: "COMPLETED",
    interruptionCount: 3,
    icon: "target",
    timeline: [
      { portion: 0.55, tone: "focus" },
      { portion: 0.08, tone: "pause" },
      { portion: 0.3, tone: "focus" },
      { portion: 0.07, tone: "idle" },
    ],
    recoveryActions: [
      { time: "09:42", title: "Reported a distraction", icon: "flag" },
      { time: "09:45", title: "Used Rescue Mode", icon: "rescue" },
      { time: "09:48", title: "Took a short break", icon: "break" },
    ],
  },
  {
    id: "h-2",
    dateKey: "2026-10-03",
    dateLabel: "Oct 3, 2026",
    timeLabel: "08:10",
    endTimeLabel: "08:55",
    goal: "API documentation",
    description: "Wrote API reference and endpoints docs.",
    plannedMinutes: 45,
    focusMinutes: 44,
    status: "COMPLETED",
    interruptionCount: 1,
    icon: "file",
    timeline: [
      { portion: 0.7, tone: "focus" },
      { portion: 0.05, tone: "pause" },
      { portion: 0.25, tone: "focus" },
    ],
    recoveryActions: [
      { time: "08:30", title: "Reported a distraction", icon: "flag" },
    ],
  },
  {
    id: "h-3",
    dateKey: "2026-10-03",
    dateLabel: "Oct 3, 2026",
    timeLabel: "10:20",
    endTimeLabel: "10:38",
    goal: "Review pull requests",
    description: "Focused on code review and feedback.",
    plannedMinutes: 30,
    focusMinutes: 18,
    status: "ABANDONED",
    interruptionCount: 2,
    icon: "lightbulb",
    timeline: [
      { portion: 0.35, tone: "focus" },
      { portion: 0.1, tone: "pause" },
      { portion: 0.15, tone: "focus" },
      { portion: 0.4, tone: "idle" },
    ],
    recoveryActions: [
      { time: "10:28", title: "Reported a distraction", icon: "flag" },
      { time: "10:33", title: "Took a short break", icon: "break" },
    ],
  },
  {
    id: "h-4",
    dateKey: "2026-10-02",
    dateLabel: "Oct 2, 2026",
    timeLabel: "16:20",
    endTimeLabel: "16:50",
    goal: "Research database indexing",
    description: "Explored indexing strategies for better performance.",
    plannedMinutes: 30,
    focusMinutes: 24,
    status: "INTERRUPTED",
    interruptionCount: 1,
    icon: "book",
    timeline: [
      { portion: 0.5, tone: "focus" },
      { portion: 0.12, tone: "pause" },
      { portion: 0.38, tone: "focus" },
    ],
    recoveryActions: [
      { time: "16:35", title: "Used Rescue Mode", icon: "rescue" },
    ],
  },
  {
    id: "h-5",
    dateKey: "2026-10-02",
    dateLabel: "Oct 2, 2026",
    timeLabel: "13:15",
    endTimeLabel: "14:05",
    goal: "Prepare project presentation",
    description: "Created slides and structured the demo flow.",
    plannedMinutes: 50,
    focusMinutes: 50,
    status: "COMPLETED",
    interruptionCount: 0,
    icon: "monitor",
    timeline: [{ portion: 1, tone: "focus" }],
    recoveryActions: [],
  },
  {
    id: "h-6",
    dateKey: "2026-10-01",
    dateLabel: "Oct 1, 2026",
    timeLabel: "11:05",
    endTimeLabel: "11:45",
    goal: "Design system polish",
    description: "Improved component states and spacing.",
    plannedMinutes: 40,
    focusMinutes: 38,
    status: "COMPLETED",
    interruptionCount: 1,
    icon: "file",
    timeline: [
      { portion: 0.6, tone: "focus" },
      { portion: 0.06, tone: "pause" },
      { portion: 0.34, tone: "focus" },
    ],
    recoveryActions: [
      { time: "11:22", title: "Reported a distraction", icon: "flag" },
    ],
  },
  {
    id: "h-7",
    dateKey: "2026-10-01",
    dateLabel: "Oct 1, 2026",
    timeLabel: "09:00",
    endTimeLabel: "09:20",
    goal: "Weekly planning",
    description: "Planned tasks for the next sprint.",
    plannedMinutes: 20,
    focusMinutes: 20,
    status: "COMPLETED",
    interruptionCount: 0,
    icon: "list",
    timeline: [{ portion: 1, tone: "focus" }],
    recoveryActions: [],
  },
];

/** Groups sessions by date, preserving the order in which dates first appear. */
export function groupSessionsByDate(
  sessions: HistorySession[],
): HistoryGroup[] {
  const todayKey = "2026-10-03";
  const yesterdayKey = "2026-10-02";
  const groups: HistoryGroup[] = [];
  const index = new Map<string, HistoryGroup>();

  for (const session of sessions) {
    let group = index.get(session.dateKey);
    if (!group) {
      const label =
        session.dateKey === todayKey
          ? "Today"
          : session.dateKey === yesterdayKey
            ? "Yesterday"
            : session.dateLabel;
      group = {
        key: session.dateKey,
        label,
        dateLabel: session.dateLabel,
        sessions: [],
      };
      index.set(session.dateKey, group);
      groups.push(group);
    }
    group.sessions.push(session);
  }

  return groups;
}
