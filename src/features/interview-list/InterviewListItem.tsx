import { useState } from "react";
import type { Interview, InterviewUpdate } from "../../types/interview";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { InterviewForm } from "../interview-form/InterviewForm";
import { useCountdown } from "../../hooks/useCountdown";
import { formatDisplay } from "../../lib/dateUtils";

interface InterviewListItemProps {
  interview: Interview;
  onUpdate: (data: InterviewUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function InterviewListItem({ interview, onUpdate, onDelete }: InterviewListItemProps) {
  const countdown = useCountdown(interview.scheduledAt);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-4 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 hover:border-gray-600 transition-colors">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-100 truncate">{interview.company}</span>
            <Badge stage={interview.stage} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{formatDisplay(interview.scheduledAt)}</span>
            <span className="text-indigo-400 font-medium">{countdown}</span>
          </div>
          {interview.notes && (
            <p className="text-xs text-gray-500 truncate max-w-sm">{interview.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" onClick={() => setEditing(true)} className="text-xs px-2 py-1">
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)} className="text-xs px-2 py-1">
            Delete
          </Button>
        </div>
      </div>

      {editing && (
        <Modal title="Edit Interview" closeOnBackdropClick={false} onClose={() => setEditing(false)}>
          <InterviewForm
            mode="edit"
            initial={interview}
            onSubmit={async (data) => { await onUpdate(data); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete Interview" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-gray-300 mb-5">
            Delete <strong className="text-white">{interview.company}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={async () => { await onDelete(interview.id); setConfirmDelete(false); }}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
