## 1. `profiles`

**Priority:** P0  
**Fungsi:** Menyimpan identitas dasar user. Satu user memiliki satu profile.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key
  - ID unik profile/user.

- `display_name`
  - Type: `varchar(100)`
  - Nama yang ditampilkan pada aplikasi.

- `avatar_url`
  - Type: `text`
  - URL avatar user.
  - Nullable.

- `timezone`
  - Type: `varchar(50)`
  - Timezone user.
  - Contoh: `Asia/Jakarta`.

- `locale`
  - Type: `varchar(10)`
  - Bahasa/locale user.
  - Contoh: `en-US`, `id-ID`.

- `created_at`
  - Type: `timestamptz`
  - Waktu profile dibuat.

- `updated_at`
  - Type: `timestamptz`
  - Waktu terakhir profile diperbarui.

---

## 2. `user_settings`

**Priority:** P0  
**Fungsi:** Menyimpan seluruh preference dan konfigurasi user dari Settings Page.  
**Relasi:** Satu user → satu `user_settings`.

### Attributes

#### Identity

- `id`
  - Type: `uuid`
  - Primary Key.

- `user_id`
  - Type: `uuid`
  - Foreign Key → `profiles.id`.

#### Appearance

- `theme`
  - Type: `varchar(20)` / enum
  - Values: `light`, `dark`, `system`.

#### Notifications

- `session_reminders_enabled`
  - Type: `boolean`
  - Default: `true`.

- `progress_updates_enabled`
  - Type: `boolean`
  - Default: `true`.

- `app_announcements_enabled`
  - Type: `boolean`
  - Default: `false`.

#### Focus Reminders

- `focus_reminder_enabled`
  - Type: `boolean`
  - Default: `true`.

- `focus_reminder_interval_minutes`
  - Type: `integer`
  - Default: `10`.

#### Break Reminders

- `break_reminder_enabled`
  - Type: `boolean`
  - Default: `true`.

- `break_reminder_interval_minutes`
  - Type: `integer`
  - Interval reminder break.

#### Audio

- `default_sound`
  - Type: `varchar(30)` / enum
  - Values: `none`, `ambient`, `nature`, `focus_sound`.

- `default_volume`
  - Type: `smallint`
  - Range: `0–100`.
  - Default: `70`.

- `remember_audio_settings`
  - Type: `boolean`
  - Default: `true`.

- `auto_start_audio`
  - Type: `boolean`
  - Default: `false`.

#### Camera & Privacy

- `camera_monitoring_enabled`
  - Type: `boolean`
  - Default: `false`.

- `camera_preview_enabled`
  - Type: `boolean`
  - Default: `true`.

- `camera_background_blur_enabled`
  - Type: `boolean`
  - Default: `true`.

- `allow_camera_signals_for_insights`
  - Type: `boolean`
  - Default: `false`.

> Raw camera video tidak disimpan atau di-upload.

#### Adaptive Focus

- `adaptive_focus_enabled`
  - Type: `boolean`
  - Default: `true`.

- `smart_session_length_enabled`
  - Type: `boolean`
  - Default: `true`.

- `use_session_history_for_recommendations`
  - Type: `boolean`
  - Default: `true`.

#### Metadata

- `created_at`
  - Type: `timestamptz`

- `updated_at`
  - Type: `timestamptz`

---

## 3. `focus_sessions`

**Priority:** P0  
**Fungsi:** Core transaction. Satu record = satu focus session.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `user_id`
  - Type: `uuid`
  - Foreign Key → `profiles.id`.

- `goal`
  - Type: `varchar(255)`
  - Goal focus session.

- `planned_duration_minutes`
  - Type: `integer`
  - Durasi yang direncanakan.

- `actual_duration_seconds`
  - Type: `integer`
  - Durasi aktual.

- `status`
  - Type: enum
  - Values: `planned`, `active`, `paused`, `completed`, `interrupted`, `abandoned`.

- `started_at`
  - Type: `timestamptz`

- `paused_at`
  - Type: `timestamptz`
  - Nullable.

- `completed_at`
  - Type: `timestamptz`
  - Nullable.

- `ended_at`
  - Type: `timestamptz`
  - Nullable.

- `interruption_count`
  - Type: `integer`
  - Default: `0`.

- `audio_enabled`
  - Type: `boolean`

- `audio_type`
  - Type: `varchar(30)` / enum
  - Values: `none`, `ambient`, `nature`, `focus_sound`.

- `audio_volume`
  - Type: `smallint`
  - Range: `0–100`.

- `camera_monitoring_enabled`
  - Type: `boolean`
  - Setting yang digunakan pada session tersebut.

- `recommendation_id`
  - Type: `uuid`
  - Foreign Key → `adaptive_focus_recommendations.id`.
  - Nullable.

- `created_at`
  - Type: `timestamptz`

- `updated_at`
  - Type: `timestamptz`

---

## 4. `session_events`

**Priority:** P0  
**Fungsi:** Mencatat seluruh aktivitas/event yang terjadi selama focus session.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `session_id`
  - Type: `uuid`
  - Foreign Key → `focus_sessions.id`.

- `event_type`
  - Type: enum/string
  - Values:
    - `session_started`
    - `session_paused`
    - `session_resumed`
    - `session_completed`
    - `session_ended`
    - `distraction_reported`
    - `rescue_mode_started`
    - `rescue_mode_completed`
    - `break_started`
    - `break_completed`
    - `audio_changed`
    - `camera_enabled`
    - `camera_disabled`

- `occurred_at`
  - Type: `timestamptz`
  - Waktu event terjadi.

- `metadata`
  - Type: `jsonb`
  - Data tambahan event.
  - Nullable.

- `created_at`
  - Type: `timestamptz`

---

## 5. `recovery_actions`

**Priority:** P0  
**Fungsi:** Mencatat recovery action yang dilakukan user selama atau setelah session.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `session_id`
  - Type: `uuid`
  - Foreign Key → `focus_sessions.id`.

- `action_type`
  - Type: enum/string
  - Values:
    - `short_break`
    - `hydrate`
    - `quick_stretch`
    - `change_environment`
    - `breathing`
    - `rescue_mode`

- `started_at`
  - Type: `timestamptz`

- `completed_at`
  - Type: `timestamptz`
  - Nullable.

- `duration_seconds`
  - Type: `integer`
  - Nullable.

- `status`
  - Type: enum
  - Values: `started`, `completed`, `skipped`, `cancelled`.

- `source`
  - Type: enum/string
  - Values: `user`, `system`, `ai`.

- `created_at`
  - Type: `timestamptz`

---

## 6. `session_feedback`

**Priority:** P1  
**Fungsi:** Menyimpan feedback user setelah focus session.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `session_id`
  - Type: `uuid`
  - Foreign Key → `focus_sessions.id`.

- `user_id`
  - Type: `uuid`
  - Foreign Key → `profiles.id`.

- `reflection`
  - Type: `text`
  - Nullable.
  - Catatan/refleksi user setelah session.

- `focus_rating`
  - Type: `smallint`
  - Range: `1–5`.
  - Nullable.

- `difficulty_rating`
  - Type: `smallint`
  - Range: `1–5`.
  - Nullable.

- `created_at`
  - Type: `timestamptz`

- `updated_at`
  - Type: `timestamptz`

---

## 7. `adaptive_focus_recommendations`

**Priority:** P1  
**Fungsi:** Menyimpan rekomendasi durasi/session yang dihasilkan sistem.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `user_id`
  - Type: `uuid`
  - Foreign Key → `profiles.id`.

- `recommended_duration_minutes`
  - Type: `integer`
  - Durasi yang direkomendasikan.

- `confidence_score`
  - Type: `numeric(5,4)`
  - Confidence recommendation.

- `reason`
  - Type: `text`
  - Alasan recommendation.

- `based_on_session_count`
  - Type: `integer`
  - Jumlah session yang digunakan sebagai basis.

- `generated_at`
  - Type: `timestamptz`

- `expires_at`
  - Type: `timestamptz`
  - Nullable.

- `model_version`
  - Type: `varchar(50)`
  - Versi algorithm/model.

- `created_at`
  - Type: `timestamptz`

---

## 8. `focus_signals`

**Priority:** P2  
**Fungsi:** Menyimpan hasil deteksi computer vision selama focus session.  
**Privacy:** Tidak menyimpan raw camera/video.

### Attributes

- `id`
  - Type: `uuid`
  - Primary Key.

- `session_id`
  - Type: `uuid`
  - Foreign Key → `focus_sessions.id`.

- `timestamp`
  - Type: `timestamptz`
  - Waktu signal terdeteksi.

- `signal_type`
  - Type: enum/string
  - Values:
    - `face_present`
    - `face_absent`
    - `looking_away`
    - `head_movement`
    - `attention_state`

- `signal_value`
  - Type: `numeric`
  - Nilai hasil detection.

- `confidence`
  - Type: `numeric(5,4)`
  - Confidence dari model.

- `duration_seconds`
  - Type: `integer`
  - Nullable.

- `created_at`
  - Type: `timestamptz`