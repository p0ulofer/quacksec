"use client";

import { ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn, formatScanDuration } from "@/lib/utils";
import type { Scan, Vulnerability } from "@/lib/api";
import {
  SEVERITY_ORDER,
  isInformational,
} from "@/lib/vulnerability-config";

interface Props {
  scan: Scan;
  vulnerabilities: Vulnerability[];
}

export function SummaryOverview({ scan, vulnerabilities }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  if (!vulnerabilities || vulnerabilities.length === 0) return null;

  const actionNeeded = vulnerabilities.filter((v) => !isInformational(v));
  const informational = vulnerabilities.length - actionNeeded.length;
  const routeFindings = vulnerabilities.filter(
    (v) => v.source === "ffuf" || v.source === "dev-endpoints",
  );

  const counts: Record<string, number> = {};
  for (const sev of SEVERITY_ORDER) {
    counts[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-1 border-b border-border px-8 py-6 md:border-b-0 md:border-r">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("summary.securityScore")}
          </p>
          <p className="font-serif text-5xl text-primary">
            {scan.securityScore ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">{t("summary.ofTen")}</p>
        </div>

        <div className="flex flex-col justify-center gap-4 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            {SEVERITY_ORDER.map((sev) => {
              return (
                <span
                  key={sev}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs",
                    (sev === "critical" || sev === "high") && "border-current/20",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", sev === "critical" ? "bg-red-500" : sev === "high" ? "bg-rose-500" : sev === "medium" ? "bg-amber-500" : sev === "low" ? "bg-emerald-500" : "bg-blue-500")} />
                  <span className="text-muted-foreground">{t(`severity.${sev}`)}</span>
                  <span className={cn("font-semibold", sev === "critical" ? "text-red-600 dark:text-red-400" : sev === "high" ? "text-rose-600 dark:text-rose-400" : sev === "medium" ? "text-amber-600 dark:text-amber-400" : sev === "low" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")}>
                    {counts[sev]}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="font-semibold">{actionNeeded.length}</span>
              <span className="text-muted-foreground">
                {t("summary.findingsRequireAction", { count: actionNeeded.length })}
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{informational}</span>
              <span className="text-muted-foreground">
                {t("summary.informationalNeutral", { count: informational })}
              </span>
            </span>
            {formatScanDuration(scan.startedAt, scan.completedAt, locale) && (
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {formatScanDuration(scan.startedAt, scan.completedAt, locale)}
                </span>
                <span className="text-muted-foreground">{t("summary.duration")}</span>
              </span>
            )}
            {scan.routesTested > 0 && (
              <span className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  {t("summary.routesTested", { count: scan.routesTested })}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}