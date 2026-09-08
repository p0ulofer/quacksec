"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowLeft,
  ShieldCheck,
  Bug,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FilterX,
} from "lucide-react";
import { api, Scan } from "@/lib/api";
import { formatScanDuration } from "@/lib/utils";
import { groupVulnerabilities, type VulnerabilityGroup } from "@/lib/group-vulnerabilities";
import {
  SEVERITY_ORDER,
  CATEGORIES,
  sourceGroupOf,
  categoryOf,
  severityConfig,
  vulnStatusConfig,
  type SeverityKey,
  type VulnStatusKey,
  type SourceGroupKey,
} from "@/lib/vulnerability-config";
import { SummaryOverview } from "@/components/vulnerabilities/summary-overview";
import { VulnerabilityGroupCard } from "@/components/vulnerabilities/vulnerability-group-card";
import { SourceFilter } from "@/components/vulnerabilities/source-filter";

type TabKey = "severity" | "category" | "status";

export default function ScanDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const scanId = params.id as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("severity");
  const [activeSources, setActiveSources] = useState<Set<SourceGroupKey>>(new Set());

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const data = await api.getScan(scanId);
        setScan(data);
      } catch {
        setError(t("scanDetail.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchScan();

    const interval = setInterval(fetchScan, 5000);
    return () => clearInterval(interval);
  }, [scanId]);

  const toggleSource = (key: SourceGroupKey) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const all = scan?.vulnerabilities ?? [];
    if (activeSources.size === 0) return all;
    return all.filter((vuln) => activeSources.has(sourceGroupOf(vuln.source)));
  }, [scan, activeSources]);

  const sourceCounts = useMemo(() => {
    const counts: Partial<Record<SourceGroupKey, number>> = {};
    for (const vuln of scan?.vulnerabilities ?? []) {
      const key = sourceGroupOf(vuln.source);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [scan]);

  const groupsBySeverity = useMemo(() => {
    const map = new Map<SeverityKey, VulnerabilityGroup[]>();
    for (const sev of SEVERITY_ORDER) {
      const groups = groupVulnerabilities(
        filtered.filter((v) => v.severity === sev),
      );
      if (groups.length > 0) map.set(sev, groups);
    }
    return map;
  }, [filtered]);

  const groupsByCategory = useMemo(() => {
    const map = new Map<string, VulnerabilityGroup[]>();
    for (const category of CATEGORIES) {
      const groups = groupVulnerabilities(
        filtered.filter((v) => categoryOf(v) === category.key),
      );
      if (groups.length > 0) map.set(category.key, groups);
    }
    return map;
  }, [filtered]);

  const groupsByStatus = useMemo(() => {
    const map = new Map<VulnStatusKey, VulnerabilityGroup[]>();
    for (const status of Object.keys(vulnStatusConfig) as VulnStatusKey[]) {
      const groups = groupVulnerabilities(
        filtered.filter((v) => v.status === status),
      );
      if (groups.length > 0) map.set(status, groups);
    }
    return map;
  }, [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("scanDetail.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-center text-red-500">{error || t("scanDetail.notFound")}</p>
          <Button asChild variant="outline" className="mt-4 mx-auto block">
            <Link href={`/${locale}/dashboard`}>{t("scanDetail.backToDashboard")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const scanStatusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
    pending: { label: t("status.pending"), icon: Clock, color: "text-muted-foreground" },
    running: { label: t("status.running"), icon: Loader2, color: "text-amber-500" },
    completed: { label: t("status.completed"), icon: CheckCircle2, color: "text-emerald-500" },
    failed: { label: t("status.failed"), icon: XCircle, color: "text-red-500" },
    cancelled: { label: t("status.cancelled"), icon: XCircle, color: "text-muted-foreground" },
  };

  const status = scanStatusConfig[scan.status] || scanStatusConfig.pending;
  const StatusIcon = status.icon;
  const vulnerabilities = scan.vulnerabilities ?? [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft className="h-4 w-4" />
              {t("scanDetail.backToDashboard")}
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl tracking-tight">{scan.targetUrl}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-sm ${status.color}`}>
                  <StatusIcon className={`h-4 w-4 ${scan.status === "running" ? "animate-spin" : ""}`} />
                  {status.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(scan.createdAt).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                </span>
                {formatScanDuration(scan.startedAt, scan.completedAt, locale) && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatScanDuration(scan.startedAt, scan.completedAt, locale)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Resumo no topo */}
        <Reveal>
          <SummaryOverview scan={scan} vulnerabilities={vulnerabilities} />
        </Reveal>

        {/* Vulnerabilities */}
        {vulnerabilities.length > 0 && (
          <Reveal className="mt-8">
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-xl">
                  <Bug className="h-5 w-5 text-rose-500" />
                  {t("scanDetail.vulnerabilitiesFound")}
                </h2>
              </div>

              <div className="px-6 py-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <TabsList>
                      <TabsTrigger value="severity">{t("scanDetail.bySeverity")}</TabsTrigger>
                      <TabsTrigger value="category">{t("scanDetail.byCategory")}</TabsTrigger>
                      <TabsTrigger value="status">{t("scanDetail.byStatus")}</TabsTrigger>
                    </TabsList>
                    <p className="text-xs text-muted-foreground">
                      {t("scanDetail.findingsCount", {
                        filtered: filtered.length,
                        total: vulnerabilities.length,
                      })}
                    </p>
                  </div>

                  <div className="mt-4">
                    <SourceFilter
                      active={activeSources}
                      onToggle={toggleSource}
                      counts={sourceCounts}
                    />
                  </div>

                  <TabsContent value="severity" className="mt-6 space-y-6">
                    {groupsBySeverity.size === 0 ? (
                      <EmptyState onClear={() => setActiveSources(new Set())} />
                    ) : (
                      [...groupsBySeverity.entries()].map(([sev, groups]) => (
                        <SeveritySection key={sev} severity={sev} groups={groups} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="category" className="mt-6 space-y-6">
                    {groupsByCategory.size === 0 ? (
                      <EmptyState onClear={() => setActiveSources(new Set())} />
                    ) : (
                      [...groupsByCategory.entries()].map(([key, groups]) => {
                        const category = CATEGORIES.find((c) => c.key === key);
                        return (
                          <CategorySection
                            key={key}
                            categoryKey={key}
                            groups={groups}
                          />
                        );
                      })
                    )}
                  </TabsContent>

                  <TabsContent value="status" className="mt-6 space-y-6">
                    {groupsByStatus.size === 0 ? (
                      <EmptyState onClear={() => setActiveSources(new Set())} />
                    ) : (
                      [...groupsByStatus.entries()].map(([statusKey, groups]) => (
                        <StatusSection key={statusKey} status={statusKey} groups={groups} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Reveal>
        )}

        {/* Scan em execução / sem achados */}
        {vulnerabilities.length === 0 && (
          <Reveal className="mt-8">
            <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                {scan.status === "running"
                  ? t("scanDetail.scanRunning")
                  : scan.status === "completed"
                    ? t("scanDetail.noVulnerabilities")
                    : t("scanDetail.scanNoResults")}
              </p>
            </div>
          </Reveal>
        )}

        {/* Dependencies */}
        {scan.dependencies && scan.dependencies.length > 0 && (
          <Reveal className="mt-6">
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("scanDetail.dependenciesDetected")}
                </h2>
              </div>
              <div className="divide-y divide-border">
                {scan.dependencies.map((dep) => (
                  <div key={dep.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{dep.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dep.detectedVersion} · {dep.detectionMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

function SeveritySection({
  severity,
  groups,
}: {
  severity: SeverityKey;
  groups: VulnerabilityGroup[];
}) {
  const t = useTranslations();
  const config = severityConfig[severity];
  const strong = severity === "critical" || severity === "high";
  const count = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${strong ? config.text : "text-muted-foreground"}`}>
          {t(`severity.${severity}`)}
        </h3>
        <Badge variant={strong ? config.badge : "outline"}>{count}</Badge>
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <VulnerabilityGroupCard
            key={group.id}
            group={group}
            defaultOpen={strong}
          />
        ))}
      </div>
    </section>
  );
}

function CategorySection({
  categoryKey,
  groups,
}: {
  categoryKey: string;
  groups: VulnerabilityGroup[];
}) {
  const t = useTranslations();
  const count = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t(`category.${categoryKey}`)}
        </h3>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <VulnerabilityGroupCard
            key={group.id}
            group={group}
            defaultOpen={group.severity === "critical" || group.severity === "high"}
          />
        ))}
      </div>
    </section>
  );
}

function StatusSection({
  status,
  groups,
}: {
  status: VulnStatusKey;
  groups: VulnerabilityGroup[];
}) {
  const t = useTranslations();
  const config = vulnStatusConfig[status];
  const count = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t(`status.${status}`)}
        </h3>
        <Badge variant={config.badge}>{count}</Badge>
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <VulnerabilityGroupCard
            key={group.id}
            group={group}
            defaultOpen={group.severity === "critical" || group.severity === "high"}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  const t = useTranslations();
  return (
    <div className="rounded-lg border border-dashed border-border py-12 text-center">
      <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">
        {t("scanDetail.noFiltersMatch")}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
        <FilterX className="mr-2 h-4 w-4" />
        {t("scanDetail.clearFilters")}
      </Button>
    </div>
  );
}
