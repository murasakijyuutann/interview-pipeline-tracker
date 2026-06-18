import type { Stage } from "../types/interview";

const STAGE_STYLES: Record<Stage, string> = {
  casual:   "bg-sky-900 text-sky-200",
  first:    "bg-blue-900 text-blue-200",
  second:   "bg-indigo-900 text-indigo-200",
  final:    "bg-purple-900 text-purple-200",
  offer:    "bg-emerald-900 text-emerald-200",
  rejected: "bg-red-900 text-red-300",
  closed:   "bg-gray-800 text-gray-400",
};

interface BadgeProps {
  stage: Stage;
}

export function Badge({ stage }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STAGE_STYLES[stage]}`}
    >
      {stage}
    </span>
  );
}
