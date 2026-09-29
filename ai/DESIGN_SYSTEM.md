# Reflow Design System

A calm, editorial visual language for deep work. The system uses generous space, soft blue surfaces, and clear actions so the interface supports focus instead of competing for attention.

## Foundations

### Color tokens

| Token          | Value     | Usage                                  |
| -------------- | --------- | -------------------------------------- |
| `ink-950`      | `#10213B` | Headings, primary text                 |
| `ink-800`      | `#1C3554` | Body emphasis                          |
| `ink-600`      | `#5F7694` | Supporting text                        |
| `ink-400`      | `#91A2B7` | Tertiary text, disabled states         |
| `sky-50`       | `#F7FAFE` | Application background                 |
| `sky-100`      | `#EFF6FD` | Soft surfaces and active navigation    |
| `sky-200`      | `#DCECFB` | Borders, focus illustrations           |
| `sky-500`      | `#2C7FE3` | Primary action and links               |
| `navy-900`     | `#102744` | Primary button and active navigation   |
| `success`      | `#14966C` | Completed status                       |
| `success-soft` | `#E7F6EF` | Completed status surface               |
| `warning`      | `#B87512` | Ended early / attention                |
| `warning-soft` | `#FFF3DD` | Attention surface                      |
| `danger`       | `#D94E5E` | Interruptions and destructive feedback |
| `danger-soft`  | `#FDEBED` | Error surface                          |

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
