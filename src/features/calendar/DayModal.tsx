import { useState } from "react";
import type { Interview, NewInterview, InterviewUpdate } from "../../types/interview";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { InterviewListItem } from "../interview-list/InterviewListItem";
import { InterviewForm } from "../interview-form/InterviewForm";

interface DayModalProps {
  dateKey: string; // "YYYY-MM-DD"
  interviews: Interview[];
  onAdd: (data: NewInterview) => Promise<void>;
  onUpdate: (data: InterviewUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClose: () => void;
}

export function DayModal({
  dateKey,
  interviews,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: DayModalProps) {
  const [addOpen, setAddOpen] = useState(false);

  const label = new Date(`${dateKey}T12:00:00`).toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Pre-fill noon on the selected date for new entries
  const prefilledAt = `${dateKey}T12:00`;

  return (
    <>
      <Modal title={label} onClose={onClose}>
        <div className="flex flex-col gap-3">
          <Button onClick={() => setAddOpen(true)} className="w-full justify-center">
            + Add Interview
          </Button>

          {interviews.length === 0 ? (
            <EmptyState message="No interviews scheduled for this day." />
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {interviews.map((interview) => (
                <InterviewListItem
                  key={interview.id}
                  interview={interview}
                  onUpdate={async (data) => { await onUpdate(data); }}
                  onDelete={async (id) => { await onDelete(id); }}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {addOpen && (
        <Modal
          title="Add Interview"
          layer={1}
          closeOnBackdropClick={false}
          onClose={() => setAddOpen(false)}
        >
          <InterviewForm
            mode="add"
            initialScheduledAt={prefilledAt}
            onSubmit={async (data) => { await onAdd(data); setAddOpen(false); }}
            onCancel={() => setAddOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
