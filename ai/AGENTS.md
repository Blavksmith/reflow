# Reflow — Technical Specification

Purpose: Spec-Driven Development for the Reflow desktop application. This specification defines what the coding agent must build, how the system should behave, and which technologies should be used.

## 1. Tujuan / Problem

Reflow helps users start deep-work sessions, use optional productivity audio, monitor session signals, and receive recovery guidance when focus becomes difficult.

The system should support users without judging their productivity or making medical conclusions. It also adapts focus session recommendations based on the user's previous session performance.

## 2. Requirements / User Stories

### A. Deep-Work Timer

* US-01: User can enter a focus goal.

* US-02: User can select a session duration.

* US-03: User can start, pause, resume, and end a session.

* US-04: User can see elapsed and remaining time.

### B. Productivity Audio

* US-05: User can turn audio on or off.

* US-06: User can select audio categories: nature, classical, ambient, instrumental, or other available sounds.

* US-07: User can control volume and pause audio.

### C. Camera Monitoring

* US-08: User can grant or deny camera permission.

* US-09: System can establish a basic posture baseline.

* US-10: System can detect sustained posture deviation.

* US-11: System can record relevant session signals without storing raw video.

* US-12: User can disable camera monitoring.

### D. Distraction and Recovery

* US-13: User can manually report distraction.

* US-14: System can detect configured observable signals.

* US-15: System can display an alert when a configured condition is met.

* US-16: System can recommend a recovery action.

* US-17: User can follow, dismiss, or snooze the recommendation.

* US-18: User can activate Rescue Mode.

### E. Adaptive Focus Session

* US-19: System can record session performance data.

* US-20: System can analyze previous session duration, interruptions, pauses, and recovery events.

* US-21: System can recommend a suitable focus duration for the next session.

* US-22: User can accept or manually change the recommended duration.

* US-23: System can recommend shorter sessions when the user frequently interrupts or ends sessions early.

* US-24: System can recommend longer sessions when the user consistently completes sessions comfortably.

* US-25: Recommendations must be optional and must not be presented as medical or definitive conclusions.

### F. Session Results

* US-26: System records planned and actual duration.

* US-27: System records interruptions, alerts, and recovery actions.

* US-28: User can view a session summary.

* US-29: System can provide suggestions based on previous sessions.

## 3. Behavior Spec — Given / When / Then

### A. Start Session

Given the user is on the Deep Work screen

When the user enters a goal, selects a duration, and clicks `Start`

Then:

* Create a new session with status `RUNNING`.

* Start the timer.

* Apply the selected audio preference.

* Request camera permission if monitoring is enabled.

* Begin monitoring only after the required permission or configuration is resolved.

* Display the active session screen.

If the user denies camera permission, the session may continue with camera monitoring disabled.

### B. Pause and Resume

Given a session has status `RUNNING`

When the user clicks `Pause`

Then:

* Stop active session time accumulation.

* Pause or optionally continue audio according to the defined audio behavior.

* Change the session status to `PAUSED`.

When the user clicks `Resume`

Then:

* Change the session status to `RUNNING`.

* Continue the timer.

* Resume monitoring if it was paused.

### C. Camera Monitoring

Given the user has enabled camera monitoring and granted permission

When the session starts

Then:

* Start camera processing.

* Establish or load the posture baseline.

* Record only the required detection events or derived metrics.

* Do not store raw video.

When sustained posture deviation exceeds the configured threshold

Then:

* Create a posture-related session event.

* Do not immediately show repeated alerts for every frame.

* Allow the alert system to evaluate whether a notification is appropriate.

### D. Distraction Alert

Given the session is running

When a configured distraction condition is sustained or the user manually reports distraction

Then:

* Create a distraction event.

* Evaluate alert cooldown and alert conditions.

* Display an alert if the conditions are satisfied.

* Provide a recovery recommendation.

* Allow the user to dismiss or snooze the alert.

The system must not state that the user is definitely distracted based only on camera signals.

### E. Recovery Action

Given a recovery recommendation is displayed

When the user selects `Recover`

Then:

* Create a recovery action with status `STARTED`.

* Display the recovery instructions.

* Track the recovery action as completed, skipped, or cancelled.

When the recovery action is completed

Then:

* Update the action status to `COMPLETED`.

* Offer the user an option to resume the session or start a shorter sprint.

### F. Rescue Mode

Given the user is in an active session

When the user clicks `I'm Losing Focus`

Then:

Display three options:

* `Recover`

* `Shorter Sprint`

* `End Session`

The system must not shame, punish, or block the user from continuing.

### G. Adaptive Focus Session

Given the user has completed previous sessions

When the user opens the Deep Work screen

Then:

* Retrieve relevant historical session data.

* Analyze completed duration, planned duration, interruptions, pauses, and recovery events.

* Generate an optional recommended focus duration.

* Display the recommended duration with a simple explanation.

Example:

> "You usually complete 25–30 minute sessions. Try a 30-minute focus session."

When the user accepts the recommendation

Then:

* Set the timer duration to the recommended duration.

* Allow the user to change the duration before starting.

When the user frequently ends sessions early or experiences repeated interruptions

Then:

* Consider recommending a shorter session.

* Do not automatically force the user to use the shorter duration.

When the user consistently completes sessions

Then:

* Consider recommending a gradual duration increase.

* Apply a configurable maximum duration to prevent excessive recommendations.

If insufficient historical data exists, use the default duration configured by the application.

### H. End Session

Given the user has an active or paused session

When the user clicks `End Session`

Then:

* Stop the timer.

* Stop camera processing.

* Stop or preserve audio according to the session setting.

* Change the session status to `COMPLETED` or `ENDED`.

* Save session metrics and events.

* Display the session summary.

### I. Session Summary

Given a session has ended

Then display:

* Focus goal.

* Planned duration.

* Actual duration.

* Session status.

* Pause count.

* Interruption count.

* Alerts.

* Recovery actions.

* Audio preference.

* Camera monitoring status.

* Adaptive focus recommendation for the next session, if available.

If enough historical data exists, display a suggestion such as:

> "You often experience difficulty after around 30 minutes. Try a shorter session next time."

Suggestions must be presented as optional experiments, not definitive conclusions.

## 4. Data / Interface Contract

### A. Session

TypeScript

TypeScript

```
type SessionStatus =
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "ENDED";

interface FocusSession {
  id: string;
  goal: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  status: SessionStatus;
  audioEnabled: boolean;
  audioCategory?: string;
  cameraEnabled: boolean;
  startedAt: string;
  endedAt?: string;
}
```

### B. Session Event

TypeScript

TypeScript

```
type SessionEventType =
  | "POSTURE_DEVIATION"
  | "DISTRACTION_REPORTED"
  | "DISTRACTION_DETECTED"
  | "ALERT_TRIGGERED"
  | "PAUSE"
  | "RESUME";

interface SessionEvent {
  id: string;
  sessionId: string;
  type: SessionEventType;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}
```

### C. Recovery Action

TypeScript

TypeScript

```
type RecoveryType =
  | "POSTURE_RESET"
  | "SCREEN_BREAK"
  | "SHORT_SPRINT"
  | "LONGER_BREAK"
  | "END_SESSION";

type RecoveryStatus =
  | "STARTED"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED";

interface RecoveryAction {
  id: string;
  sessionId: string;
  type: RecoveryType;
  status: RecoveryStatus;
  startedAt?: string;
  completedAt?: string;
}
```

### D. Session Summary

TypeScript

TypeScript

```
interface SessionSummary {
  sessionId: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  interruptionCount: number;
  alertCount: number;
  recoveryActions: RecoveryAction[];
  audioCategory?: string;
  cameraEnabled: boolean;
  recommendation?: string;
}
```

### E. Recovery Recommendation

TypeScript

TypeScript

```
interface RecoveryRecommendation {
  type: RecoveryType;
  title: string;
  message: string;
  reason: string;
  estimatedDurationSeconds?: number;
}
```

### F. Adaptive Focus Recommendation

TypeScript

TypeScript

```
type RecommendationReason =
  | "INSUFFICIENT_DATA"
  | "FREQUENT_INTERRUPTION"
  | "EARLY_SESSION_END"
  | "CONSISTENT_COMPLETION"
  | "STABLE_PERFORMANCE";

interface AdaptiveFocusRecommendation {
  recommendedDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  reason: RecommendationReason;
  explanation: string;
  confidence?: number;
}
```

### G. Adaptive Focus Configuration

TypeScript

TypeScript

```
interface AdaptiveFocusConfig {
  defaultDurationSeconds: number;
  minimumDurationSeconds: number;
  maximumDurationSeconds: number;
  adjustmentStepSeconds: number;
  minimumSessionsRequired: number;
}
```

### Contract Rules

* Duration values use seconds.

* Timestamps use ISO 8601 format.

* IDs must be unique.

* Camera metrics must not contain raw video data.

* Detection confidence is optional and must not be treated as medical certainty.

* Adaptive recommendations must not override user-selected duration automatically.

* Recommendations must stay within the configured minimum and maximum duration.

## 5. Acceptance Criteria

### Deep-Work Timer

* User can start a session with a goal and duration.

* Timer displays elapsed and remaining time.

* User can pause, resume, and end the session.

* Session status is updated correctly.

### Productivity Audio

* User can enable or disable audio.

* User can select an audio category.

* User can control volume and playback.

* Audio settings are applied when the session starts.

### Camera Monitoring

* User is asked for camera permission.

* User can continue without camera monitoring.

* Camera processing stops when the session ends.

* Raw video is not stored.

* Sustained posture deviation can create a session event.

### Distraction and Recovery

* User can manually report distraction.

* System can create a distraction event.

* Alert cooldown prevents excessive repeated alerts.

* Alert contains a clear recovery action.

* User can dismiss or snooze alerts.

* Rescue Mode provides three clear options.

* The system does not shame or block the user.

### Adaptive Focus Session

* System records completed session performance data.

* System can calculate a recommended focus duration.

* Recommendation uses previous session data when sufficient data exists.

* Default duration is used when historical data is insufficient.

* User can accept or change the recommendation.

* Recommendation stays within configured duration limits.

* System can recommend shorter sessions after frequent interruptions or early endings.

* System can recommend gradual increases after consistent completion.

* Adaptive recommendations do not force a duration or automatically change user preferences.

### Session Results

* Session summary is displayed after ending a session.

* Summary contains duration, interruptions, alerts, and recovery actions.

* Recovery action status is recorded.

* Future suggestions are optional and based on available session data.

* No productivity score or medical conclusion is presented.

### Technical Quality

* Components are reusable.

* Interfaces match the defined data contracts.

* Invalid session states are handled.

* Camera and audio permissions are handled safely.

* No raw video is persisted.

* The application does not repeatedly interrupt the user unnecessarily.

* Adaptive recommendation logic is separated from the UI.

* Recommendation logic can be tested independently.

## 6. Tech Stack
Desktop Application

Tauri 2 — Desktop application framework.

React — User interface.

TypeScript — Type safety and application logic.

Vite — Frontend development and build tool.

Rust — Tauri backend and native desktop capabilities.

UI and State Management

Tailwind CSS — Styling.

shadcn/ui — Reusable UI components.

Lucide React — Icons.

Zustand — Session and application state.

React Hook Form — Form management.

Zod — Input and schema validation.

date-fns — Date and duration handling.

Camera and Computer Vision

MediaPipe Tasks Vision — Face and posture-related landmarks.

WebRTC / MediaDevices API — Camera access.

Canvas API — Processing camera frames.

OpenCV (optional) — Additional computer vision processing if required.

Camera processing should initially run locally in the application. Avoid adding a separate Python service unless the computer vision requirements cannot be handled efficiently in the frontend or Tauri backend.

Audio

HTML5 Audio API — Audio playback.

Web Audio API — Volume and audio control.

Howler.js (optional) — Simplified audio management.

Database and Backend

Supabase — Backend-as-a-Service for database, authentication, and optional data synchronization.

PostgreSQL — Database provided by Supabase.

Supabase Auth — User authentication and session management.

Supabase JavaScript Client (@supabase/supabase-js) — Frontend communication with Supabase.

Supabase Row Level Security (RLS) — Restrict users to accessing their own data.

Supabase Realtime (optional) — Real-time updates if required in future features.

## 9. Implementation Priority

1. Phase 1: Timer, session state, audio settings, and local database.

2. Phase 2: Camera permission, camera processing, and detection events.

3. Phase 3: Alerts, recovery actions, and Rescue Mode.

4. Phase 4: Adaptive Focus Session and recommendation logic.

5. Phase 5: Session evaluation, insights, and future personalization.

Core flow:

`Start Session → Monitor → Detect Signals → Recovery → Resume → End Session → Adaptive Insights`
