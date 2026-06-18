import { useState } from "react";
import { useInterviews } from "./features/interview-list/useInterviews";
import { InterviewList } from "./features/interview-list/InterviewList";
import { InterviewForm } from "./features/interview-form/InterviewForm";
import { StageFilterBar } from "./features/stage-filter/StageFilterBar";
import { PastInterviews } from "./features/archive/PastInterviews";
import { CalendarView } from "./features/calendar/CalendarView";
import { Modal } from "./components/Modal";
import { Button } from "./components/Button";

type View = "list" | "calendar";

export default function App() {
  const { all, upcoming, past, loading, error, stageFilter, toggleStageFilter, add, update, remove } =
    useInterviews();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<View>("list");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Interview Pipeline</h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 transition-colors ${
                  view === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-3 py-1.5 transition-colors ${
                  view === "calendar"
                    ? "bg-indigo-600 text-white"
                    : "bg-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                Calendar
              </button>
            </div>
            {view === "list" && (
              <Button onClick={() => setAddOpen(true)}>+ Add</Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded bg-red-950 border border-red-700 px-3 py-2 text-sm text-red-300 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-gray-500 py-10 text-center">Loading…</p>
        ) : view === "list" ? (
          <>
            <div className="mb-5">
              <StageFilterBar active={stageFilter} onToggle={toggleStageFilter} />
            </div>
            <InterviewList
              interviews={upcoming}
              onUpdate={update}
              onDelete={remove}
              emptyMessage="No upcoming interviews. Add one to get started."
            />
            <PastInterviews interviews={past} onUpdate={update} onDelete={remove} />
          </>
        ) : (
          <CalendarView
            interviews={all}
            onAdd={add}
            onUpdate={update}
            onDelete={remove}
          />
        )}
      </div>

      {addOpen && (
        <Modal title="Add Interview" onClose={() => setAddOpen(false)}>
          <InterviewForm
            mode="add"
            onSubmit={async (data) => { await add(data); setAddOpen(false); }}
            onCancel={() => setAddOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
