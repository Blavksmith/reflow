# Reflow Design System

A calm, editorial visual language for deep work. The system uses generous space, soft blue surfaces, and clear actions so the interface supports focus instead of competing for attention.

## Foundations

### Color tokens

| Token                  | Value                                                            | Usage                                  |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `ink-950`              | `#10213B`                                                        | Headings, primary text                 |
| `ink-800`              | `#1C3554`                                                        | Body emphasis                          |
| `ink-600`              | `#5F7694`                                                        | Supporting text                        |
| `ink-400`              | `#91A2B7`                                                        | Tertiary text, disabled states         |
| `sky-50`               | `#F7FAFE`                                                        | Very light blue surfaces               |
| `pale-blue`            | `#E5F0FC`                                                        | Legacy solid blue surface              |
| `page-gradient`        | `linear-gradient(135deg, #F7FAFD 0%, #EEF5FB 45%, #E3EFF9 100%)` | Global page background                 |
| `sky-100`              | `#EFF6FD`                                                        | Soft surfaces and active navigation    |
| `focus-card-blue`      | `#DFEEFE`                                                        | Shared focus card surface              |
| `primary-cta-gradient` | `linear-gradient(135deg, #2176E8 0%, #4D91F3 100%)`              | Primary call-to-action surface         |
| `sky-200`              | `#DCECFB`                                                        | Borders, focus illustrations           |
| `sky-500`              | `#2C7FE3`                                                        | Primary action and links               |
| `navy-900`             | `#102744`                                                        | Primary button and active navigation   |
| `success`              | `#14966C`                                                        | Completed status                       |
| `success-soft`         | `#E7F6EF`                                                        | Completed status surface               |
| `warning`              | `#B87512`                                                        | Ended early / attention                |
| `warning-soft`         | `#FFF3DD`                                                        | Attention surface                      |
| `danger`               | `#D94E5E`                                                        | Interruptions and destructive feedback |
| `danger-soft`          | `#FDEBED`                                                        | Error surface                          |

Light tokens define the daytime Reflow experience. The dark theme keeps the same semantic roles and hierarchy, but resolves surfaces, text, borders, and soft status backgrounds to dedicated night values. Components should consume these semantic roles rather than introducing page-specific dark colors.

Avoid using more than one saturated accent in a single component. Status colors communicate state, never performance judgement.

### Typography

- **Primary family:** Raleway, loaded from Google Fonts with a system sans-serif fallback.
- **Display:** 42px / 1.08 / 650, tracking `-0.045em`.
- **Page heading:** 34px / 1.15 / 650, tracking `-0.04em`.
- **Section heading:** 18px / 1.25 / 650.
- **Body:** 14px / 1.55 / 450.
- **Label:** 11px / 1.3 / 700, uppercase, tracking `0.14em`.
- **Meta:** 12px / 1.4 / 500.

### Shape and elevation

- Small control radius: `12px`.
- Card radius: `18px`.
- Hero radius: `24px`.
- Border: `1px solid rgba(191, 207, 226, 0.6)`.
- Soft shadow: `0 10px 30px rgba(35, 76, 116, 0.06)`.
- Elevated control: `0 8px 18px rgba(16, 39, 68, 0.14)`.

### Layout

- Desktop canvas target: `1440 × 1024`.
- Top navigation height: `92px`.
- Icon rail width: `76px`.
- Content max width: `1320px`.
- Main grid: 1fr / 0.75fr at wide desktop.
- Base spacing unit: `4px`; common gaps are 16, 24, 32, and 40px.

### Interaction

- Every interactive control has hover, keyboard focus, and disabled states.
- Primary CTA is the only high-contrast action in a section.
- Disabled actions remain visible with a `Soon` label and muted surface.
- Use icons to reinforce meaning, not as decoration.
- Motion is limited to short color/position transitions; no looping animation in the dashboard.

### Illustration direction

Use abstract horizons, clouds, and soft geometric forms. The Reflow character is a friendly supporting mark, not a mascot that dominates the experience. Do not use illustration to convey productivity scores or judgement.

## Page headers

Use the same core header recipe across page types so navigation feels consistent while preserving page-specific content.

### Core recipe

- Container: `max-w-[1320px]`, `pt-8`, horizontal padding `px-6` with `lg:px-10` and `xl:px-12`.
- Header spacing: `mb-8`; keep the header content column at `max-w-[950px]` when a supporting visual sits beside it.
- Eyebrow/date label: `font-inter` (Inter with system sans fallback), `13px`, `font-bold`, uppercase, `tracking-[0.1em]`, `text-sky-500`, with `mb-4` before the page heading.
- Page heading: `text-[42px]` on small screens and `sm:text-[56px]`, `font-semibold`, `leading-[1.08]`, `tracking-[-0.05em]`, `text-ink-950`.
- Subtitle: `mt-4`, `text-[18px]`, `leading-relaxed`, `text-ink-600`.

### Progress indicator

The session flow uses exactly three dots: setup is step 1 of 3, focus is step 2 of 3, and summary is step 3 of 3. Use `h-1.5 w-1.5`, `gap-1.5`, active `bg-sky-500`, and inactive `bg-sky-200`, with an accessible `aria-label` describing the current step. The Dashboard uses the same core typography and spacing but does not show progress dots because it is not part of the session flow.

### Page-specific content

Keep the page label and heading copy relevant to the page. Dashboard may retain its date, supporting quote, and hero character on the right; session pages may retain their session label and three-dot progress indicator. These content differences must not change the shared typography scale or vertical rhythm.

## Dark / Night Theme

Reflow supports Light, Dark, and System preferences without changing its layout, typography, or visual identity. Dark mode is a calm night interpretation of the same blue editorial system; it is not a separate visual style.

### Dark color tokens

| Token | Value | Usage |
| --- | --- | --- |
| `dark-page` | `#0B1220` | Dark page base background |
| `dark-page-gradient` | `linear-gradient(135deg, #0B1220 0%, #101B2D 50%, #142238 100%)` | Global dark page background |
| `dark-surface` | `#111C2E` | Main cards and navigation surfaces |
| `dark-surface-elevated` | `#17243A` | Elevated controls, inputs, and nested surfaces |
| `dark-surface-soft` | `#1B2A42` | Soft sections, muted controls, and secondary surfaces |
| `dark-ink-950` | `#F3F7FC` | Headings and primary text |
| `dark-ink-800` | `#D9E4F2` | Body emphasis and controls |
| `dark-ink-600` | `#9FB0C7` | Supporting text |
| `dark-ink-400` | `#71839C` | Tertiary and disabled text |
| `dark-border` | `rgba(148, 174, 207, 0.18)` | Borders and dividers |
| `success-soft-dark` | `rgba(20, 150, 108, 0.14)` | Completed status surface |
| `warning-soft-dark` | `rgba(184, 117, 18, 0.14)` | Attention status surface |
| `danger-soft-dark` | `rgba(217, 78, 94, 0.14)` | Error/interruption status surface |

The existing `sky-500` (`#2C7FE3`) remains the primary accent in both themes. Dark hover and focus states may use `#4D91F3`. Status foreground hues remain `success`, `warning`, and `danger`; only their soft surfaces change for night contrast.

### Component behavior

- Cards use `dark-surface`, elevated cards and controls use `dark-surface-elevated`, and soft backgrounds use `dark-surface-soft`.
- Navigation keeps the same dimensions and spacing. Dark navigation uses translucent dark surfaces, light text, and a deep navy active state; the sidebar keeps blue active icons and soft blue selected surfaces.
- Inputs, selects, sliders, toggles, lists, empty states, status indicators, timer surfaces, and dialogs use the same semantic hierarchy with dark borders and controls rather than pure black or white.
- Existing Reflow illustrations remain recognizable. Dark page surfaces and horizon treatments are adjusted through theme tokens without redesigning the mascot.

### Theme behavior and transition

- **Light** applies the light token set.
- **Dark** applies the dark token set.
- **System** resolves to the operating system `prefers-color-scheme` value and updates when the OS preference changes.
- The selected preference is persisted under the app's theme storage key so it survives restart.
- Theme-dependent background, text, border, surface, and shadow properties transition for approximately 300ms with an ease timing function. Layout, typography, and position are not animated.

### Accessibility

Both themes retain visible keyboard focus states and readable contrast. State is not communicated by color alone: controls keep labels, icons, and selected indicators. Native controls receive the active `color-scheme`, and `prefers-reduced-motion: reduce` disables the theme transition and minimizes motion.