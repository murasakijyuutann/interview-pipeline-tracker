import { getDb } from "./client";
import {
  type Interview,
  type InterviewRow,
  type NewInterview,
  type InterviewUpdate,
  rowToInterview,
} from "../types/interview";

export async function getAllInterviews(): Promise<Interview[]> {
  const db = await getDb();
  const rows = await db.select<InterviewRow[]>(
    "SELECT * FROM interviews ORDER BY scheduled_at ASC"
  );
  return rows.map(rowToInterview);
}

export async function createInterview(data: NewInterview): Promise<Interview> {
  console.log("[createInterview] data:", data);
  const db = await getDb();
  let result;
  try {
    result = await db.execute(
      `INSERT INTO interviews (company, stage, scheduled_at, notes, reminder_minutes_before)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.company,
        data.stage,
        data.scheduledAt,
        data.notes ?? null,
        data.reminderMinutesBefore ?? 60,
      ]
    );
    console.log("[createInterview] execute result:", result);
  } catch (e) {
    console.error("[createInterview] INSERT failed:", e);
    throw e;
  }
  const rows = await db.select<InterviewRow[]>(
    "SELECT * FROM interviews WHERE id = $1",
    [result.lastInsertId]
  );
  console.log("[createInterview] fetched row:", rows[0]);
  return rowToInterview(rows[0]);
}

export async function updateInterview(data: InterviewUpdate): Promise<Interview> {
  const db = await getDb();
  const now = new Date().toISOString();

  // Build SET clause dynamically from provided fields
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.company !== undefined)              { fields.push(`company = $${idx++}`);                values.push(data.company); }
  if (data.stage !== undefined)                { fields.push(`stage = $${idx++}`);                  values.push(data.stage); }
  if (data.scheduledAt !== undefined)          { fields.push(`scheduled_at = $${idx++}`);           values.push(data.scheduledAt);
    // Reset reminder so it fires again at the new time
    fields.push(`reminder_fired = $${idx++}`); values.push(0); }
  if (data.notes !== undefined)                { fields.push(`notes = $${idx++}`);                  values.push(data.notes); }
  if (data.reminderMinutesBefore !== undefined){ fields.push(`reminder_minutes_before = $${idx++}`);values.push(data.reminderMinutesBefore); }
  if (data.reminderFired !== undefined)        { fields.push(`reminder_fired = $${idx++}`);         values.push(data.reminderFired ? 1 : 0); }

  fields.push(`updated_at = $${idx++}`);
  values.push(now);
  values.push(data.id);

  await db.execute(
    `UPDATE interviews SET ${fields.join(", ")} WHERE id = $${idx}`,
    values
  );

  const rows = await db.select<InterviewRow[]>(
    "SELECT * FROM interviews WHERE id = $1",
    [data.id]
  );
  return rowToInterview(rows[0]);
}

export async function deleteInterview(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM interviews WHERE id = $1", [id]);
}

export async function markReminderFired(id: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    "UPDATE interviews SET reminder_fired = 1, updated_at = $1 WHERE id = $2",
    [now, id]
  );
}
