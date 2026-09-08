import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScanDuration(startedAt: string | null, completedAt: string | null, locale?: string): string | null {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMs = end - start;

  if (diffMs < 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minLabel = locale === "en" ? "min" : "min";
  const secLabel = locale === "en" ? "s" : "s";

  if (minutes === 0) return `${seconds}${secLabel}`;
  return `${minutes}${minLabel} ${seconds}${secLabel}`;
}
