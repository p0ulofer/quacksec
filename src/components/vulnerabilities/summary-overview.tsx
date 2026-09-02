"use client";

import { ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { cn, formatScanDuration } from "@/lib/utils";
import type { Scan, Vulnerability } from "@/lib/api";
import {
  SEVERITY_ORDER,
  severityConfig,
  isInformational,
} from "@/lib/vulnerability-config";

interface Props {
  scan: Scan;
  vulnerabilities: Vulnerability[];
}

export function SummaryOverview({ scan, vulnerabilities }: Props) {
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
            Score de segurança
          </p>
          <p className="font-serif text-5xl text-primary">
            {scan.securityScore ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">de 10</p>
        </div>

        <div className="flex flex-col justify-center gap-4 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            {SEVERITY_ORDER.map((sev) => {
              const config = severityConfig[sev];
              return (
                <span
                  key={sev}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs",
                    (sev === "critical" || sev === "high") && "border-current/20",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", config.dot)} />
                  <span className="text-muted-foreground">{config.label}</span>
                  <span className={cn("font-semibold", config.text)}>
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
                achado{actionNeeded.length === 1 ? "" : "s"} requerem ação
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{informational}</span>
              <span className="text-muted-foreground">
                informativo{informational === 1 ? "" : "s"}/neutro
                {informational === 1 ? "" : "s"}
              </span>
            </span>
            {formatScanDuration(scan.startedAt, scan.completedAt) && (
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {formatScanDuration(scan.startedAt, scan.completedAt)}
                </span>
                <span className="text-muted-foreground">de duração</span>
              </span>
            )}
            {scan.routesTested > 0 && (
              <span className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  {scan.routesTested}{" "}
                  {scan.routesTested === 1 ? "rota" : "rotas"} testadas
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}