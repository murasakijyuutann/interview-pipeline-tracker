import { useState } from "react";
import type { Interview, InterviewUpdate } from "../../types/interview";
import { InterviewList } from "../interview-list/InterviewList";

interface PastInterviewsProps {
  interviews: Interview[];
  onUpdate: (data: InterviewUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function PastInterviews({ interviews, onUpdate, onDelete }: PastInterviewsProps) {
  const [open, setOpen] = useState(false);

  if (interviews.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        Past interviews ({interviews.length})
      </button>

      {open && (
        <div className="mt-3 opacity-60">
          <InterviewList
            interviews={interviews}
            onUpdate={onUpdate}
            onDelete={onDelete}
            emptyMessage="No past interviews."
          />
        </div>
      )}
    </div>
  );
}
