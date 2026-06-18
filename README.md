# Interview Pipeline Tracker

A lightweight desktop app for tracking active job interview pipelines. Never miss a scheduled interview or casual conversation (カジュアル面談) — entries are sorted by upcoming date, filterable by stage, and a background reminder engine fires native OS notifications before each event.

Fully local: no cloud account, no server, no email. Just a SQLite database on your machine.

---

## Features

- **Add / Edit / Delete** interview entries — company, stage, date & time, reminder offset, notes
- **List view** — sorted by soonest upcoming, with colour-coded stage badges and live countdown labels ("in 2 days", "tomorrow 14:00", "today 09:30")
- **Calendar view** — month grid showing all interviews per day with time and stage badge; click any day to view, add, edit, or delete entries
- **Stage filter** — toggle-filter the list by one or more stages
- **Past entries** — auto-archived in a collapsible section once the scheduled time has elapsed
- **Background reminder engine** — polls every 60 seconds, fires a native OS notification when `now >= scheduled_at - reminder_minutes_before`; resets automatically if you reschedule an interview

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2 (Rust) |
| Frontend | React 19 + TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS v4 |
| Storage | SQLite via `tauri-plugin-sql` (migrations on startup) |
| Notifications | `tauri-plugin-notification` (native OS) |
| Date handling | `chrono` (Rust) · `Date` / `Intl` (TypeScript) |
| Direct DB access | `rusqlite` (background reminder thread) |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Rust + Cargo | ≥ 1.77 | [rustup.rs](https://rustup.rs) |
| Tauri CLI | ≥ 2.x | `cargo install tauri-cli` |
| WebView2 Runtime | any | Ships with Microsoft Edge on Windows 10/11 |

---

## Getting Started

```bash
# Install JS dependencies
npm install

# Start dev mode (hot-reload frontend + Rust backend)
npm run tauri:dev

# Build a production installer
npm run tauri:build
```

The production build outputs two installers to `src-tauri/target/release/bundle/`:

| Installer | Path |
|-----------|------|
| NSIS setup wizard | `nsis/Interview Pipeline Tracker_0.1.0_x64-setup.exe` |
| MSI package | `msi/Interview Pipeline Tracker_0.1.0_x64_en-US.msi` |

Run either installer once and the app appears in your Start Menu — no VS Code or terminal required to launch it.

---

## Project Structure

```
interview-pipeline-tracker/
├── src-tauri/                          # Rust backend
│   ├── src/
│   │   ├── main.rs                     # Entrypoint — calls lib::run()
│   │   ├── lib.rs                      # Tauri builder, plugin registration, migration
│   │   └── reminder.rs                 # Background thread: polls DB, fires notifications
│   ├── migrations/
│   │   └── 0001_initial.sql            # interviews table schema
│   ├── capabilities/
│   │   └── default.json                # Permission grants (sql, notification, core)
│   ├── Cargo.toml
│   ├── tauri.conf.json                 # Window config, CSP, bundle targets
│   └── build.rs
│
├── src/                                # React frontend
│   ├── main.tsx
│   ├── App.tsx                         # Layout + List/Calendar view toggle
│   │
│   ├── db/
│   │   ├── client.ts                   # Singleton DB connection
│   │   └── interviews.ts               # CRUD queries
│   │
│   ├── types/
│   │   └── interview.ts                # Interview interface, Stage enum, row mapper
│   │
│   ├── features/
│   │   ├── interview-list/
│   │   │   ├── InterviewList.tsx
│   │   │   ├── InterviewListItem.tsx   # Row: badge, countdown, edit/delete
│   │   │   └── useInterviews.ts        # Fetch, sort, filter, CRUD state
│   │   ├── interview-form/
│   │   │   ├── InterviewForm.tsx       # Add / Edit modal form
│   │   │   └── StageSelect.tsx
│   │   ├── stage-filter/
│   │   │   └── StageFilterBar.tsx
│   │   ├── archive/
│   │   │   └── PastInterviews.tsx      # Collapsible past entries
│   │   └── calendar/
│   │       ├── CalendarView.tsx        # Month grid with navigation
│   │       ├── CalendarDay.tsx         # Day cell: time + badge + company
│   │       └── DayModal.tsx            # Day detail: list + add entry
│   │
│   ├── components/
│   │   ├── Badge.tsx                   # Stage colour badge
│   │   ├── Button.tsx                  # primary / ghost / danger variants
│   │   ├── Modal.tsx                   # Accessible overlay
│   │   └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   └── useCountdown.ts             # Live-updating relative time label
│   │
│   ├── lib/
│   │   └── dateUtils.ts                # formatCountdown, isPast, toDatetimeLocal, …
│   │
│   └── styles/
│       └── globals.css                 # Tailwind v4 import + base layer
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Data Model

### SQLite — `interviews` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `INTEGER` PK | Auto-increment |
| `company` | `TEXT NOT NULL` | Company name |
| `stage` | `TEXT NOT NULL` | `casual` · `first` · `second` · `final` · `offer` · `rejected` · `closed` |
| `scheduled_at` | `DATETIME NOT NULL` | ISO 8601 |
| `notes` | `TEXT` | Nullable |
| `reminder_minutes_before` | `INTEGER` | Default `60` |
| `reminder_fired` | `INTEGER` | `0` / `1` — prevents duplicate notifications; resets on reschedule |
| `created_at` | `DATETIME` | Set on insert |
| `updated_at` | `DATETIME` | Updated on every edit |

### TypeScript types

```ts
type Stage = "casual" | "first" | "second" | "final" | "offer" | "rejected" | "closed";

interface Interview {
  id: number;
  company: string;
  stage: Stage;
  scheduledAt: string;           // ISO 8601
  notes: string | null;
  reminderMinutesBefore: number;
  reminderFired: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create (id/timestamps omitted — generated by DB)
type NewInterview = Omit<Interview, "id" | "reminderFired" | "createdAt" | "updatedAt">
  & { reminderMinutesBefore?: number };

// Update (id required, all other fields optional)
type InterviewUpdate = Partial<Omit<Interview, "id" | "createdAt" | "updatedAt">>
  & { id: number };
```

---

## Reminder Logic

The Rust background thread (`reminder.rs`) runs on a 60-second tick:

1. Opens the SQLite DB directly via `rusqlite`
2. Queries all rows where `reminder_fired = 0` and `scheduled_at > now`
3. For each row: if `now >= scheduled_at - reminder_minutes_before * 60s` → fire OS notification and set `reminder_fired = 1`

Editing an interview's `scheduled_at` via the UI resets `reminder_fired` to `0` so the notification fires again at the new time.

---

## Window

| Setting | Value |
|---------|-------|
| Default size | 1400 × 900 |
| Minimum size | 900 × 600 |
| Resizable | Yes |
| Launches centered | Yes |
