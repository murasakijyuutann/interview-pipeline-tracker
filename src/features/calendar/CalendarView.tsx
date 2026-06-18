import { useState, useMemo } from "react";
import type { Interview, NewInterview, InterviewUpdate } from "../../types/interview";
import { CalendarDay } from "./CalendarDay";
import { DayModal } from "./DayModal";
import { Button } from "../../components/Button";

interface CalendarViewProps {
  interviews: Interview[];
  onAdd: (data: NewInterview) => Promise<void>;
  onUpdate: (data: InterviewUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

/** Normalise any ISO string to a local "YYYY-MM-DD" key */
function toDateKey(isoString: string): string {
  const d = new Date(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ interviews, onAdd, onUpdate, onDelete }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Group all interviews by local date key
  const byDate = useMemo(() => {
    const map = new Map<string, Interview[]>();
    for (const i of interviews) {
      const key = toDateKey(i.scheduledAt);
      map.set(key, [...(map.get(key) ?? []), i]);
    }
    return map;
  }, [interviews]);

  // Build the 6-row grid (42 cells max) anchored to Sunday
  const gridDays = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < firstDow; i++) {
      cells.push({ date: new Date(year, month, 1 - (firstDow - i)), isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
      }
    }
    return cells;
  }, [year, month]);

  const todayKey = toDateKey(today.toISOString());
  const monthLabel = new Date(year, month, 1).toLocaleString([], {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const selectedInterviews = selectedKey ? (byDate.get(selectedKey) ?? []) : [];

  return (
    <>
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" onClick={prevMonth} className="px-2.5 py-1">‹</Button>
        <Button variant="ghost" onClick={nextMonth} className="px-2.5 py-1">›</Button>
        <span className="font-medium text-gray-200 min-w-36 text-center">{monthLabel}</span>
        <Button variant="ghost" onClick={goToday} className="ml-auto text-xs px-2.5 py-1">
          Today
        </Button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-0.5">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-800 border border-gray-800 rounded-lg overflow-hidden">
        {gridDays.map(({ date, isCurrentMonth }) => {
          const key = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
          ].join("-");
          return (
            <CalendarDay
              key={key}
              date={date}
              dateKey={key}
              isCurrentMonth={isCurrentMonth}
              isToday={key === todayKey}
              isSelected={key === selectedKey}
              interviews={byDate.get(key) ?? []}
              onClick={() => setSelectedKey(key === selectedKey ? null : key)}
            />
          );
        })}
      </div>

      {/* Day detail modal */}
      {selectedKey && (
        <DayModal
          dateKey={selectedKey}
          interviews={selectedInterviews}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </>
  );
}
