# Reflow --- Frontend Page Design Prompts

Design reference: https://strawberrybrowser.com/?ref=saaspo.com

## Global Design Direction

Design a premium desktop productivity application called **Reflow**,
focused on deep work, focus recovery, and adaptive focus sessions.

Use a clean, modern, editorial-inspired SaaS aesthetic with a dominant
**calm blue color palette**. The interface should feel peaceful,
spacious, focused, and refined rather than corporate or overly
analytical.

### Visual Language

-   Dominant colors: soft blue, pale sky blue, white, muted navy, and
    soft slate.
-   Use blue as the primary accent for interactive elements and focus
    states.
-   Use subtle pastel colors for statuses:
    -   Muted green for completed.
    -   Soft amber for attention.
    -   Muted coral for interruptions.
-   Use generous whitespace and clear visual hierarchy.
-   Use rounded cards with moderate corner radius.
-   Use subtle 1px borders and very light shadows.
-   Use elegant typography with strong hierarchy and excellent
    readability.
-   Use restrained gradients only when they improve visual hierarchy.
-   Avoid excessive glassmorphism, neon colors, visual clutter, generic
    dashboard templates, and unnecessary decorative elements.
-   Use abstract illustrations, simple geometric shapes, peaceful
    workspace imagery, or empty illustration placeholders.
-   Do not design the final character or mascot. Reserve dedicated
    visual areas for a future custom character design.

### UX Principles

-   Calm and distraction-free.
-   One primary action per section.
-   Clear navigation and predictable interactions.
-   Focus on the user's next action rather than displaying too much
    information.
-   Support accessibility with sufficient contrast, visible focus
    states, and readable text.
-   Desktop-first design for a Tauri application.
-   Use realistic dummy content, not lorem ipsum.
-   Create a coherent design system across all pages while giving each
    page a distinct layout.

------------------------------------------------------------------------

# 1. Dashboard / Home

## Goal

The dashboard is the user's starting point for understanding today's
focus status and starting a session quickly.

## Prompt

Design the **Reflow Dashboard / Home page** for a calm productivity
desktop application.

Create a distinctive, clean dashboard layout that does not look like a
generic analytics admin panel. The main focus should be helping users
quickly understand their current focus status and start a session.

### Layout

-   Use a persistent, slim left navigation sidebar with:
    -   Reflow logo.
    -   Home.
    -   Focus Session.
    -   History.
    -   Insights.
    -   Settings.
-   Use a spacious main content area.
-   Place a calm greeting and today's date at the top.
-   Create a prominent but minimal primary focus area with:
    -   A short contextual message.
    -   Recommended focus duration.
    -   A large **Start Focus Session** button.
-   Use an asymmetrical layout rather than equal-sized cards everywhere.
-   Include a compact focus overview:
    -   Total focus time.
    -   Completed sessions.
    -   Interruptions.
-   Include recent sessions with clear status indicators.
-   Include a small Quick Actions area:
    -   Start Focus Session.
    -   Open Rescue Mode.
    -   Audio Library.
-   Include a calm recommendation panel communicating the adaptive focus
    duration.
-   Add a subtle visual element such as an abstract landscape, horizon,
    or blue gradient shape.
-   Do not include a character or mascot. Reserve the visual area for
    future custom artwork.

### Interaction and Quality

-   The primary CTA must be visually dominant.
-   Make navigation states clear.
-   Use hover and selected states with soft blue backgrounds.
-   Keep the dashboard informative but not overwhelming.
-   Use realistic sample data.
-   Design for a desktop viewport approximately 1440 × 1024.

------------------------------------------------------------------------

# 2. Session Setup

## Goal

The user chooses a goal, duration, audio, and camera settings before
starting a session.

## Prompt

Design the **Reflow Session Setup page** for a calm deep-work
productivity application.

The page should feel like a quiet preparation space before starting
focused work. Prioritize clarity and intentional decision-making over
dense configuration.

### Layout

-   Keep the main navigation sidebar consistent with the Dashboard.
-   Use a centered, spacious setup panel with the title:
    -   **Prepare your focus session**
-   Use a two-column layout:
    -   Left: session goal and focus duration.
    -   Right: session preferences and adaptive recommendation.
-   Include a focus goal input:
    -   Label: **What are you focusing on?**
    -   Support a short task or goal description.
-   Include a duration selector:
    -   Recommended duration.
    -   Presets: 15, 25, 45, and 60 minutes.
    -   Custom duration option.
-   Clearly display the adaptive recommendation:
    -   Recommended duration.
    -   Short explanation based on previous sessions.
    -   Option to override the recommendation.
-   Include audio preferences:
    -   Audio enabled toggle.
    -   Audio category selection.
    -   Volume control.
-   Include camera monitoring:
    -   Optional toggle.
    -   Clear privacy explanation.
    -   State that raw video is not stored or uploaded.
-   Add a large primary CTA:
    -   **Start Session**
-   Add a secondary action:
    -   **Cancel** or **Back**

### Visual Direction

-   Use a calm blue background with a white primary setup surface.
-   Use soft visual separation between sections.
-   Avoid making every setting a separate card.
-   Use progressive disclosure for advanced options where appropriate.
-   Make the recommended duration visually clear without forcing the
    user to follow it.
-   Do not include character artwork.

------------------------------------------------------------------------

# 3. Focus Session

## Goal

This is the core deep-work experience. The interface must minimize
distractions and prioritize the timer.

## Prompt

Design the **Reflow Focus Session page**, the core deep-work experience
of the application.

This page must be visually quiet and distraction-free. The timer is the
primary element. Avoid a dashboard-like layout and remove unnecessary
information while the user is focusing.

### Layout

-   Use a minimal full-window layout.
-   Keep navigation reduced or hidden during an active focus session.
-   Include a subtle top bar with:
    -   Reflow logo.
    -   Current session goal.
    -   Session status.
    -   Minimal exit control.
-   Place a large central timer as the visual anchor.
-   Display:
    -   Remaining time.
    -   Elapsed time.
    -   Circular or linear progress indicator.
-   Include minimal session controls:
    -   Pause.
    -   Resume.
    -   End Session.
-   Add a discreet bottom control area with:
    -   Audio controls.
    -   Volume.
    -   Camera monitoring status.
    -   Report Distraction.
-   Include a subtle status indicator:
    -   Monitoring enabled.
    -   Monitoring disabled.
    -   Permission required.
-   Provide a non-intrusive space for a recovery prompt or Rescue Mode
    notification.
-   Make Report Distraction accessible without making it visually
    dominant.
-   Use a calm blue monochromatic visual treatment with generous
    whitespace.

### UX Requirements

-   Do not use excessive animations or distracting visual effects.
-   The timer must remain highly readable.
-   Pause and End Session must be clearly distinguishable.
-   Do not make the user feel punished when reporting a distraction.
-   Camera signals must not be presented as definitive judgments about
    focus or health.
-   Design active and paused states.
-   Do not include a character or mascot.

------------------------------------------------------------------------

# 4. Recovery / Rescue Mode

## Goal

Help the user return to focus without making them feel guilty or judged.

## Prompt

Design the **Reflow Rescue Mode experience** for users who are
distracted, interrupted, or struggling to return to focus.

The experience should feel supportive, calm, and optional. It must not
resemble an error screen, warning dashboard, or punitive productivity
system.

### Layout

-   Design this as a focused modal or dedicated overlay above the Focus
    Session page.
-   Use a soft calm-blue background with a clear central recovery panel.
-   Show a gentle contextual message, such as:
    -   **Let's take a moment to reset.**
    -   **Ready to return to your focus?**
-   Show the reason for the recovery prompt in neutral language:
    -   User-reported distraction.
    -   An interruption.
    -   A voluntary request for help.
-   Provide one primary recovery recommendation:
    -   Take a short breathing break.
    -   Reset for 30 seconds.
    -   Review the session goal.
    -   Resume with a shorter focus interval.
-   Include a simple visual progress indicator for the recovery
    activity.
-   Include actions:
    -   Resume Session.
    -   Snooze.
    -   Dismiss.
    -   End Session.
-   Make recovery optional and clearly communicate user control.
-   Use supportive copy without guilt, shame, or performance pressure.

### Visual Direction

-   Use rounded surfaces, subtle blue gradients, and restrained
    illustrations.
-   Avoid red error states and alarming warning icons.
-   Avoid excessive gamification, streak pressure, and negative scoring.
-   Make the interface feel like a calm intervention, not a forced
    interruption.
-   Do not include a final character design.

------------------------------------------------------------------------

# 5. Session Summary

## Goal

Provide a useful summary after a session without overwhelming the user
with metrics.

## Prompt

Design the **Reflow Session Summary page** displayed after a focus
session ends.

The page should help users reflect on their session in a calm and
constructive way. It should feel like a personal reflection space rather
than a performance evaluation.

### Layout

-   Use a spacious centered content layout.
-   Show a clear completion header:
    -   **Session complete**
    -   Or a neutral message when the session ends early.
-   Display a prominent session summary:
    -   Focus duration.
    -   Session goal.
    -   Completion status.
-   Use a small group of meaningful metrics:
    -   Interruptions.
    -   Recovery actions.
    -   Alerts triggered.
-   Display audio and camera status in a compact information section.
-   Include a reflection or insight panel:
    -   Suggested improvement for the next session.
    -   Adaptive duration recommendation.
-   Add a session timeline or simple event summary if useful.
-   Include primary actions:
    -   Start Another Session.
    -   Return to Dashboard.
-   Include a clear secondary action to close or exit the summary.

### Visual Direction

-   Use calm blue, white, and muted status colors.
-   Use positive but neutral language.
-   Do not overemphasize completion scores.
-   Avoid confetti, aggressive celebration, streak pressure, and
    excessive badges.
-   Use a clean vertical hierarchy with enough whitespace.
-   Do not include a character or mascot.

------------------------------------------------------------------------

# 6. History

## Goal

Display previous sessions with easy-to-use filters.

## Prompt

Design the **Reflow History page** for reviewing previous focus
sessions.

The page should prioritize scanability, clarity, and calm data
exploration. Avoid making it look like a complex enterprise data table.

### Layout

-   Use the standard Reflow sidebar navigation.
-   Add a page header:
    -   **Your focus history**
    -   Supporting text explaining that users can review previous
        sessions.
-   Include a compact summary area:
    -   Total focus time.
    -   Completed sessions.
    -   Average session duration.
-   Use a clean session list or table with generous spacing.
-   Each session item should display:
    -   Session goal.
    -   Date and time.
    -   Duration.
    -   Completion status.
    -   Interruption count.
-   Add filters:
    -   Date range.
    -   Session status.
    -   Duration.
-   Add search by session goal.
-   Include pagination or progressive loading if needed.
-   Provide a clear empty state when there are no sessions.
-   Allow a session item to open its detailed Session Summary.

### Visual Direction

-   Use white surfaces on a pale blue background.
-   Prefer a clean list with subtle dividers over dense spreadsheet
    styling.
-   Use soft status indicators.
-   Keep filtering controls compact and organized.
-   Avoid unnecessary charts on this page; detailed trends belong in
    Insights.
-   Do not include character artwork.

------------------------------------------------------------------------

# 7. Insights

## Goal

Show focus development and patterns in an informative, non-judgmental
way.

## Prompt

Design the **Reflow Insights page** for understanding personal focus
patterns over time.

The page should feel like a calm personal analytics space, not a
competitive productivity leaderboard. Emphasize meaningful trends and
actionable reflection.

### Layout

-   Use the standard Reflow sidebar navigation.
-   Add a page header:
    -   **Understand your focus**
    -   Supporting text about learning from previous sessions.
-   Include a time range selector:
    -   This week.
    -   This month.
    -   Custom range.
-   Use a balanced analytical layout with a limited number of charts:
    -   Focus time trend.
    -   Average session duration.
    -   Interruption frequency.
    -   Completion rate.
-   Include a visual comparison of planned versus completed focus
    duration.
-   Add a personal pattern panel:
    -   Common focus periods.
    -   Session duration patterns.
    -   Recovery activity frequency.
-   Add a calm recommendation section:
    -   Suggested next focus duration.
    -   A short explanation of the observed pattern.
-   Use simple charts with clear labels and tooltips.
-   Provide an empty state for users without enough data.

### Visual Direction

-   Use calm blue as the primary chart color.
-   Use muted colors only for comparison and status.
-   Avoid excessive graphs, overly precise scoring, and misleading
    conclusions.
-   Do not imply that camera-based signals are medical or definitive
    assessments.
-   Use accessible chart labels and visual patterns.
-   Do not include a character or mascot.

------------------------------------------------------------------------

# 8. Settings

## Goal

Manage application configuration, audio, privacy, and adaptive focus.

## Prompt

Design the **Reflow Settings page** for configuring the desktop
application.

The page should be organized, simple, and easy to navigate. Prioritize
clear grouping and avoid presenting every setting as an isolated card.

### Layout

-   Use the standard Reflow sidebar.
-   Create a settings layout with:
    -   A secondary settings navigation column.
    -   A main settings content area.
-   Settings categories:
    -   General.
    -   Audio.
    -   Camera & Privacy.
    -   Adaptive Focus.

### General Settings

-   Theme: Light, Dark, System.
-   Notification preferences.
-   Default focus duration.

### Audio Settings

-   Default audio category.
-   Default volume.
-   Auto-play audio toggle.

### Camera & Privacy

-   Camera permission status.
-   Enable or disable camera monitoring.
-   Clear privacy explanation.
-   Explicitly state that raw video is not stored or uploaded.

### Adaptive Focus

-   Enable or disable recommendations.
-   Recommendation sensitivity.
-   Allow automatic duration suggestions.

### Visual Direction

-   Use a calm, structured, documentation-like settings interface.
-   Keep sections visually separated through typography and spacing.
-   Avoid excessive cards and decorative illustrations.
-   Use clear accessible form controls.
-   Use neutral and transparent language for privacy.
-   Do not include a character or mascot.

------------------------------------------------------------------------

# 9. Onboarding

## Goal

Introduce the application and help the user configure essential
preferences without a long process.

## Prompt

Design the **Reflow First-Time Onboarding flow** for a calm desktop
productivity application.

The onboarding should be short, welcoming, and focused on helping users
configure the essentials. Avoid long forms and excessive feature
explanations.

### Flow

Create a 3--4 step onboarding experience:

1.  Welcome to Reflow.
2.  Set the default focus preference.
3.  Configure optional audio and camera monitoring.
4.  Complete setup and enter the Dashboard.

### Layout

-   Use a distraction-free centered layout.
-   Use a clear progress indicator.
-   Provide one primary action per step.
-   Include Back and Skip options where appropriate.
-   Introduce the main purpose of Reflow:
    -   Support deep work.
    -   Help users recover from distractions.
    -   Adapt focus sessions based on previous activity.
-   Ask for a default focus duration.
-   Explain that camera monitoring is optional.
-   Explain privacy in simple, transparent language.
-   Introduce Rescue Mode without overwhelming the user.
-   End with a clear CTA:
    -   **Go to Dashboard**

### Visual Direction

-   Use calm blue and white with subtle abstract visual elements.
-   Leave space for a future custom Reflow character or illustration.
-   Avoid overly playful onboarding, excessive animation, and long
    marketing copy.
-   Keep each step visually simple and readable.

------------------------------------------------------------------------

# 10. Audio Library

## Goal

Provide an organized way to select productivity audio during focus
sessions.

## Prompt

Design the **Reflow Audio Library page** for selecting productivity
audio during focus sessions.

Create a calm, organized audio browsing experience. The page should not
resemble a music streaming service with excessive album art or
distracting content.

### Layout

-   Use the standard Reflow sidebar.
-   Add a page header:
    -   **Find your focus sound**
-   Include audio categories:
    -   Nature.
    -   Classical.
    -   Ambient.
    -   Instrumental.
-   Include a compact audio player with:
    -   Play and pause.
    -   Volume.
    -   Progress.
    -   Selected audio title.
-   Use clean audio list items with:
    -   Audio title.
    -   Category.
    -   Duration.
    -   Play action.
-   Highlight the currently selected audio with a soft blue state.
-   Include a search field or category filter.
-   Add a small section for recently used audio.

### Visual Direction

-   Use abstract sound waves, calm gradients, or simple category icons.
-   Avoid heavy album-art grids.
-   Avoid visual clutter and excessive animation.
-   Keep audio controls accessible and easy to understand.
-   Do not include a character or mascot.

------------------------------------------------------------------------

# Recommended Design Order

1.  Dashboard
    -   Establish the design system, sidebar, cards, and primary CTA.
2.  Session Setup
    -   Design forms, duration selector, and preferences.
3.  Focus Session
    -   Design the timer and distraction-free layout.
4.  Session Summary
    -   Design reflection and session metrics.
5.  History
    -   Design the session list, filters, and empty state.
6.  Settings
    -   Design form controls and privacy settings.
7.  Recovery / Rescue Mode
    -   Design modal, recovery states, and optional actions.
8.  Insights
    -   Design charts and personal patterns.
9.  Onboarding
    -   Design the first-time user experience.
10. Audio Library

-   Design audio browsing and player controls.

------------------------------------------------------------------------

# Anti-Slop Quality Control Prompt

Add this section to the end of every Pen.dev design request:

## Anti-Slop Requirements

Do not produce a generic AI-generated SaaS dashboard.

### Avoid

-   Repetitive equal-sized cards.
-   Excessive gradients and glassmorphism.
-   Unnecessary floating decorations.
-   Overuse of rounded containers.
-   Random charts without meaningful context.
-   Excessive badges, emojis, and decorative icons.
-   Generic motivational copy repeated across the interface.
-   Crowded layouts with too many competing primary actions.
-   Unnecessary character illustrations.
-   Fake complexity or features that are not part of the Reflow
    requirements.

### Prioritize

-   A distinct and intentional page composition.
-   Clear visual hierarchy.
-   Calm blue visual identity.
-   Consistent spacing and typography.
-   Functional information architecture.
-   Realistic content and meaningful empty states.
-   Responsive behavior within a desktop application.
-   High-quality interaction states:
    -   Hover.
    -   Focus.
    -   Disabled.
    -   Loading.
    -   Empty.
    -   Error.
    -   Success.
-   A polished design that looks intentionally designed by a product
    designer, not automatically assembled from generic UI cards.
