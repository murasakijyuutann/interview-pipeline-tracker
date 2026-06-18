import type { Interview } from "../../types/interview";
import { Badge } from "../../components/Badge";

interface CalendarDayProps {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  interviews: Interview[];
  onClick: () => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  interviews,
  onClick,
}: CalendarDayProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex flex-col gap-1 p-2 min-h-[140px] text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
        isCurrentMonth ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-950 hover:bg-gray-900",
        isSelected ? "ring-2 ring-inset ring-indigo-500" : "",
      ].join(" ")}
    >
      <span
        className={[
          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0",
          isToday
            ? "bg-indigo-600 text-white"
            : isCurrentMonth
            ? "text-gray-300"
            : "text-gray-600",
        ].join(" ")}
      >
        {date.getDate()}
      </span>

      <div className="flex flex-col gap-1 overflow-hidden w-full mt-0.5">
        {interviews.map((i) => (
          <div key={i.id} className="flex items-start gap-1.5 min-w-0">
            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 tabular-nums">
              {new Date(i.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <Badge stage={i.stage} />
              <span className="text-xs text-gray-300 truncate leading-tight">
                {i.company}
              </span>
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
