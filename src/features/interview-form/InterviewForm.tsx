import { useState } from "react";
import type { Interview, NewInterview, InterviewUpdate, Stage } from "../../types/interview";
import { StageSelect } from "./StageSelect";
import { Button } from "../../components/Button";
import { toDatetimeLocal, fromDatetimeLocal } from "../../lib/dateUtils";

interface AddProps {
  mode: "add";
  initialScheduledAt?: string; // pre-fill datetime-local (e.g. "2026-06-20T12:00")
  onSubmit: (data: NewInterview) => Promise<void>;
  onCancel: () => void;
}

interface EditProps {
  mode: "edit";
  initial: Interview;
  onSubmit: (data: InterviewUpdate) => Promise<void>;
  onCancel: () => void;
}

type InterviewFormProps = AddProps | EditProps;

export function InterviewForm(props: InterviewFormProps) {
  const initial = props.mode === "edit" ? props.initial : null;

  const [company, setCompany] = useState(initial?.company ?? "");
  const [stage, setStage] = useState<Stage>(initial?.stage ?? "casual");
  const [scheduledAt, setScheduledAt] = useState(
    initial ? toDatetimeLocal(initial.scheduledAt)
    : props.mode === "add" && props.initialScheduledAt ? props.initialScheduledAt
    : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initial?.reminderMinutesBefore ?? 60
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) { setError("Company name is required."); return; }
    if (!scheduledAt)    { setError("Scheduled date/time is required."); return; }

    setError(null);
    setSubmitting(true);
    try {
      if (props.mode === "add") {
        await props.onSubmit({
          company: company.trim(),
          stage,
          scheduledAt: fromDatetimeLocal(scheduledAt),
          notes: notes.trim() || null,
          reminderMinutesBefore,
        });
      } else {
        await props.onSubmit({
          id: props.initial.id,
          company: company.trim(),
          stage,
          scheduledAt: fromDatetimeLocal(scheduledAt),
          notes: notes.trim() || null,
          reminderMinutesBefore,
        });
      }
    } catch (err) {
      console.error("[InterviewForm] submit error:", err);
      const msg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
      setError(msg || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded bg-red-950 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="company" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Company *
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Mercari"
          className="rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="stage" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Stage *
        </label>
        <StageSelect id="stage" value={stage} onChange={setStage} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="scheduled-at" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Date &amp; Time *
        </label>
        <input
          id="scheduled-at"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="reminder" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Remind me (minutes before)
        </label>
        <input
          id="reminder"
          type="number"
          min={1}
          max={1440}
          value={reminderMinutesBefore}
          onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
          className="rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Recruiter name, interview format, things to prepare..."
          className="rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={props.onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : props.mode === "add" ? "Add Interview" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
