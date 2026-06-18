# Interview Pipeline Tracker — Project Outline

## 1. Purpose

A lightweight desktop app to track active job interview pipelines (company, stage, scheduled datetime, recruiter notes) and surface local reminders so upcoming interviews and casual conversations (カジュアル面談) are never missed.

## 2. Goals

- Keep a single source of truth for all active interview pipelines
- Provide at-a-glance visibility into what's coming up next
- Trigger native OS notifications ahead of scheduled events
- Stay fully local — no cloud account, no external server, no email sending

## 3. Non-Goals

- No email notifications (in-app / OS notifications only, per current scope)
- No calendar sync (Google Calendar, Outlook, etc.) in v1
- No multi-user or team features
- No mobile app

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Shell | Tauri | Smaller binary than Electron; Rust backend |
| Frontend | React + TypeScript | Matches existing portfolio stack |
| Storage | SQLite via `tauri-plugin-sql` | Local file, no server |
| Notifications | Tauri notification plugin | Native OS-level notifications |
| Styling | Tailwind CSS (optional) | Fast iteration, consistent spacing |

## 5. Data Model

Table: `interviews`

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | Auto-increment |
| `company` | TEXT | Company name |
| `stage` | TEXT (enum) | `casual`, `first`, `second`, `final`, `offer`, `rejected`, `closed` |
| `scheduled_at` | DATETIME | ISO 8601 |
| `notes` | TEXT | Free-form recruiter / interview notes |
| `reminder_minutes_before` | INTEGER | Default e.g. 60 |
| `created_at` | DATETIME | Auto-set on insert |

## 6. Core Features (v1)

1. **Add / Edit / Delete interview entry** — company, stage, datetime, notes, reminder offset
2. **List view** — sorted by soonest upcoming `scheduled_at`, with stage badge and relative countdown (e.g. "in 2 days", "tomorrow 14:00")
3. **Local reminder engine** — background task checks `now` against `scheduled_at - reminder_minutes_before` and fires a native OS notification once per entry
4. **Stage filter** — quick filter/toggle by stage (e.g. show only upcoming casual/first-round interviews)
5. **Past entries archive** — entries move to a collapsed "past" section once `scheduled_at` has elapsed

## 7. Stretch Features (later)

- Manual "snooze" / re-trigger reminder
- Recruiter contact field (e.g. Nishioka-san / Geekly) tagged per entry
- Simple stats view (e.g. interviews per week, stage funnel counts)
- Export to CSV for backup

## 8. Build Phases

| Phase | Scope |
|---|---|
| 1 | Scaffold Tauri + React project, set up SQLite schema |
| 2 | Build CRUD UI for interview entries |
| 3 | Build sorted list view with stage badges + countdowns |
| 4 | Wire up background reminder check + native notification |
| 5 | Polish: stage filters, archive view, packaging for distribution |

## 9. Open Questions

- Should reminders persist/re-fire if the app was closed when the trigger time passed?
- Should there be a default reminder offset per stage (e.g. casual chats get a shorter heads-up than final-round interviews)?
