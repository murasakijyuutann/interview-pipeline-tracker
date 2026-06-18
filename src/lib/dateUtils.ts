/**
 * Format a scheduled_at ISO string as a human-friendly relative label.
 * Examples: "in 2 days", "tomorrow 14:00", "today 09:30", "3 days ago"
 */
export function formatCountdown(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  const timeStr = target.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (diffMins < -60 * 24) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago`;
  if (diffMins < 0)        return "passed";
  if (diffMins < 60)       return `in ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
  if (diffHours < 24)      return `today ${timeStr}`;
  if (diffDays === 1)      return `tomorrow ${timeStr}`;
  return `in ${diffDays} days`;
}

/** Returns true if the scheduled_at has already passed. */
export function isPast(isoString: string): boolean {
  return new Date(isoString).getTime() < Date.now();
}

/** Format ISO string to a readable datetime for display, e.g. "Jun 20, 14:00" */
export function formatDisplay(isoString: string): string {
  return new Date(isoString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format ISO string to a datetime-local input value (YYYY-MM-DDTHH:mm) */
export function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert a datetime-local input value back to a full ISO string */
export function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}
