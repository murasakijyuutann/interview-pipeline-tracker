import { STAGES, type Stage } from "../../types/interview";

interface StageFilterBarProps {
  active: Stage[];
  onToggle: (stage: Stage) => void;
}

export function StageFilterBar({ active, onToggle }: StageFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STAGES.map((stage) => {
        const isActive = active.includes(stage);
        return (
          <button
            key={stage}
            onClick={() => onToggle(stage)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors border ${
              isActive
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
