import { STAGES, type Stage } from "../../types/interview";

interface StageSelectProps {
  value: Stage;
  onChange: (stage: Stage) => void;
  id?: string;
}

export function StageSelect({ value, onChange, id }: StageSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Stage)}
      className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
