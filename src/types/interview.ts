export const STAGES = [
  "casual",
  "first",
  "second",
  "final",
  "offer",
  "rejected",
  "closed",
] as const;

export type Stage = typeof STAGES[number];

export interface Interview {
  id: number;
  company: string;
  stage: Stage;
  scheduledAt: string;           // ISO 8601, e.g. "2026-06-20T14:00:00+09:00"
  notes: string | null;
  reminderMinutesBefore: number; // default 60
  reminderFired: boolean;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

// Shape used when creating a new interview (no id/timestamps — DB generates these)
export type NewInterview = Omit<
  Interview,
  "id" | "reminderFired" | "createdAt" | "updatedAt"
> & {
  reminderMinutesBefore?: number; // optional on create, defaults to 60 in DB
};

// Shape used when editing an existing interview (everything optional except id)
export type InterviewUpdate = Partial<
  Omit<Interview, "id" | "createdAt" | "updatedAt">
> & {
  id: number;
};

// Raw snake_case row returned by tauri-plugin-sql (SQLite)
export interface InterviewRow {
  id: number;
  company: string;
  stage: Stage;
  scheduled_at: string;
  notes: string | null;
  reminder_minutes_before: number;
  reminder_fired: number; // SQLite boolean — 0 or 1
  created_at: string;
  updated_at: string;
}

export function rowToInterview(row: InterviewRow): Interview {
  return {
    id: row.id,
    company: row.company,
    stage: row.stage,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
    reminderMinutesBefore: row.reminder_minutes_before,
    reminderFired: row.reminder_fired === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
