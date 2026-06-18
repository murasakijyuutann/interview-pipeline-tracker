import { useState, useEffect } from "react";
import { formatCountdown } from "../lib/dateUtils";

/**
 * Returns a live-updating countdown string for a given ISO datetime.
 * Re-evaluates every 30 seconds.
 */
export function useCountdown(scheduledAt: string): string {
  const [label, setLabel] = useState(() => formatCountdown(scheduledAt));

  useEffect(() => {
    setLabel(formatCountdown(scheduledAt));
    const id = setInterval(() => {
      setLabel(formatCountdown(scheduledAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  return label;
}
