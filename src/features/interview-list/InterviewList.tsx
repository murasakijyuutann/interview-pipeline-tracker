import type { Interview, InterviewUpdate } from "../../types/interview";
import { InterviewListItem } from "./InterviewListItem";
import { EmptyState } from "../../components/EmptyState";

interface InterviewListProps {
  interviews: Interview[];
  onUpdate: (data: InterviewUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  emptyMessage?: string;
}

export function InterviewList({ interviews, onUpdate, onDelete, emptyMessage }: InterviewListProps) {
  if (interviews.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {interviews.map((interview) => (
        <InterviewListItem
          key={interview.id}
          interview={interview}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
