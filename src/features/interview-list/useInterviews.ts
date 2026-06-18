import { useState, useEffect, useCallback } from "react";
import type { Interview, NewInterview, InterviewUpdate, Stage } from "../../types/interview";
import {
  getAllInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../../db/interviews";
import { isPast } from "../../lib/dateUtils";

export function useInterviews() {
  const [all, setAll] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<Stage[]>([]);

  const load = useCallback(async () => {
    try {
      const rows = await getAllInterviews();
      setAll(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = all
    .filter((i) => !isPast(i.scheduledAt))
    .filter((i) => stageFilter.length === 0 || stageFilter.includes(i.stage));

  const past = all
    .filter((i) => isPast(i.scheduledAt))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  async function add(data: NewInterview) {
    const created = await createInterview(data);
    setAll((prev) => [...prev, created].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    ));
  }

  async function update(data: InterviewUpdate) {
    const updated = await updateInterview(data);
    setAll((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function remove(id: number) {
    await deleteInterview(id);
    setAll((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleStageFilter(stage: Stage) {
    setStageFilter((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  }

  return { all, upcoming, past, loading, error, stageFilter, toggleStageFilter, add, update, remove, reload: load };
}
