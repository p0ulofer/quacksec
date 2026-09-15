"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  Filter,
  Search,
  AlertTriangle,
  Bug,
  Lock,
  Globe,
  ShieldAlert,
  Loader2,
  Flame,
  CheckCircle2,
  ListChecks,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { api, Vulnerability, ScannedUrl } from "@/lib/api";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type VulnStatus = "open" | "confirmed" | "false_positive" | "fixed";
type ScanModuleKey = "api_scanner" | "dependency_analyzer" | "config_analyzer";

const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const severityBadgeMap: Record<Severity, "critical" | "danger" | "warning" | "success" | "secondary"> = {
  critical: "critical",
  high: "danger",
  medium: "warning",
  low: "success",
  info: "secondary",
};

const statusBadgeMap: Record<VulnStatus, "critical" | "success" | "warning" | "secondary"> = {
  open: "critical",
  confirmed: "warning",
  false_positive: "secondary",
  fixed: "success",
};

const scanModules: { key: ScanModuleKey; labelKey: string }[] = [
  { key: "api_scanner", labelKey: "scanModule.api_scanner" },
  { key: "dependency_analyzer", labelKey: "scanModule.dependency_analyzer" },
  { key: "config_analyzer", labelKey: "scanModule.config_analyzer" },
];

export default function VulnerabilidadesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<VulnStatus | "all">("all");
  const [moduleFilter, setModuleFilter] = useState<ScanModuleKey | "all">("all");
  const [urlFilter, setUrlFilter] = useState<string>(searchParams.get("url") || "all");
  const [urgentMode, setUrgentMode] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scannedUrls, setScannedUrls] = useState<ScannedUrl[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        const data = await api.getVulnerabilities();
        setVulns(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVulns();
  }, []);

  useEffect(() => {
    api.getScannedUrls().then(setScannedUrls).catch(() => {});
  }, []);

  const updateUrlParam = useCallback(
    (value: string) => {
      setUrlFilter(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete("url");
      } else {
        params.set("url", value);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    let result = vulns.filter((v) => {
      const matchesSearch =
        search === "" ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description?.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || v.severity === severityFilter;
      const matchesStatus =
        statusFilter === "all" || v.status === statusFilter;
      const matchesModule =
        moduleFilter === "all" || v.module === moduleFilter;
      const matchesUrl =
        urlFilter === "all" ||
        v.affectedEndpoint?.includes(urlFilter) ||
        v.scanId === urlFilter;
      return matchesSearch && matchesSeverity && matchesStatus && matchesModule && matchesUrl;
    });

    if (urgentMode) {
      result = [...result].sort((a, b) => {
        const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (sevDiff !== 0) return sevDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }

    return result;
  }, [vulns, search, severityFilter, statusFilter, moduleFilter, urlFilter, urgentMode]);

  const counts = useMemo(() => {
    const base = urgentMode
      ? vulns.filter((v) => v.status === "open" || v.status === "confirmed")
      : vulns;
    const c: Record<string, number> = { all: base.length };
    for (const v of base) {
      c[v.severity] = (c[v.severity] ?? 0) + 1;
    }
    return c;
  }, [vulns, urgentMode]);

  const filteredCounts = useMemo(() => {
    const c: Record<string, number> = { all: filtered.length };
    for (const v of filtered) {
      c[v.severity] = (c[v.severity] ?? 0) + 1;
    }
    return c;
  }, [filtered]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  }, [filtered, selectedIds.size]);

  const openCount = vulns.filter((v) => v.status === "open").length;
  const criticalCount = vulns.filter((v) => v.severity === "critical").length;

  const generatePlanTitle = useMemo(() => {
    if (selectedIds.size === 0) return "";
    const selected = vulns.filter((v) => selectedIds.has(v.id));
    const sevCounts: Record<string, number> = {};
    for (const v of selected) {
      sevCounts[v.severity] = (sevCounts[v.severity] ?? 0) + 1;
    }
    const topSev = Object.entries(sevCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topSev) {
      return `${t(`severity.${topSev}`)} - ${selected.length} ${t("remediationPlans.vulnerabilities").toLowerCase()}`;
    }
    return `${selected.length} ${t("remediationPlans.vulnerabilities").toLowerCase()}`;
  }, [selectedIds, vulns, t]);

  const handleCreatePlan = async () => {
    if (!planTitle.trim() || selectedIds.size === 0) return;
    setCreatingPlan(true);
    try {
      await api.createRemediationPlan({
        title: planTitle.trim(),
        description: planDescription.trim() || undefined,
        vulnerabilityIds: Array.from(selectedIds),
      });
      setSelectedIds(new Set());
      setShowPlanModal(false);
      setPlanTitle("");
      setPlanDescription("");
      const data = await api.getVulnerabilities();
      setVulns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPlan(false);
    }
  };

  const severities: Severity[] = ["critical", "high", "medium", "low", "info"];
  const statuses: VulnStatus[] = ["open", "confirmed", "false_positive", "fixed"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl tracking-tight">{t("vulnerabilities.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? (
              t("common.loading")
            ) : (
              <>
                {t("vulnerabilities.resultsFound", { total: filtered.length })} ·{" "}
                {t("vulnerabilities.criticalCount", {
                  count: filteredCounts["critical"] ?? 0,
                })} ·{" "}
                {t("vulnerabilities.openCount", {
                  count: filtered.filter((v) => v.status === "open").length,
                })}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{t("vulnerabilities.loading")}</p>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("vulnerabilities.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowUrlDropdown(!showUrlDropdown)}
                      onBlur={() => setTimeout(() => setShowUrlDropdown(false), 200)}
                      className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {urlFilter === "all"
                        ? t("vulnerabilities.allUrls")
                        : scannedUrls.find((u) => u.url === urlFilter)?.name || urlFilter}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {showUrlDropdown && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                        <button
                          onClick={() => { updateUrlParam("all"); setShowUrlDropdown(false); }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                            urlFilter === "all" ? "bg-accent text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {t("vulnerabilities.allUrls")}
                          {urlFilter === "all" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                        {scannedUrls.map((u) => (
                          <button
                            key={u.url}
                            onClick={() => { updateUrlParam(u.url); setShowUrlDropdown(false); }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                              urlFilter === u.url ? "bg-accent text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">{u.name || u.url}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.url}</p>
                            </div>
                            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                              {u.scanCount}x
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("vulnerabilities.severityLabel")}
                  </span>
                  <button
                    onClick={() => setSeverityFilter("all")}
                    className={pillClass(severityFilter === "all")}
                  >
                    {t("vulnerabilities.allSeverities")} ({counts.all})
                  </button>
                  {severities.map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={pillClass(severityFilter === sev)}
                    >
                      {t(`severity.${sev}`)} ({counts[sev] ?? 0})
                    </button>
                  ))}

                  <span className="ml-4 text-xs font-medium text-muted-foreground">
                    {t("vulnerabilities.statusLabel")}
                  </span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={pillClass(statusFilter === "all")}
                  >
                    {t("vulnerabilities.allStatuses")}
                  </button>
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={pillClass(statusFilter === s)}
                    >
                      {t(`status.${s}`)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("vulnerabilities.moduleLabel")}
                  </span>
                  <button
                    onClick={() => setModuleFilter("all")}
                    className={pillClass(moduleFilter === "all")}
                  >
                    {t("vulnerabilities.allModules")}
                  </button>
                  {scanModules.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setModuleFilter(m.key)}
                      className={pillClass(moduleFilter === m.key)}
                    >
                      {t(m.labelKey)}
                    </button>
                  ))}

                  <button
                    onClick={() => setUrgentMode(!urgentMode)}
                    className={`ml-4 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      urgentMode
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-border bg-card text-muted-foreground hover:border-orange-300 hover:text-orange-600"
                    }`}
                  >
                    <Flame className="mr-1 inline h-3 w-3" />
                    {t("vulnerabilities.urgentMode")}
                  </button>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-border py-20 text-center">
                  <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("vulnerabilities.noResults")}
                  </p>
                </div>
              )}

              {filtered.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size > 0
                      ? t("vulnerabilities.selectedCount", { count: selectedIds.size })
                      : t("vulnerabilities.selectAll")}
                  </span>
                </div>
              )}

              {filtered.map((vuln, i) => {
                const isExpanded = expandedId === vuln.id;
                const isSelected = selectedIds.has(vuln.id);
                return (
                  <Reveal key={vuln.id} delay={Math.min(i * 0.04, 0.24)}>
                    <div
                      className={`overflow-hidden rounded-lg border bg-card transition-all duration-300 ${
                        isExpanded
                          ? "border-primary/40 shadow-md"
                          : isSelected
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(vuln.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 shrink-0 rounded border-border text-primary accent-primary"
                        />
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : vuln.id)}
                          className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${severityIconClass(vuln.severity)}`}
                            >
                              <Bug className="h-5 w-5" strokeWidth={1.6} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{vuln.title}</span>
                                <Badge variant={severityBadgeMap[vuln.severity] || "secondary"}>
                                  {t(`severity.${vuln.severity}`)}
                                </Badge>
                                <Badge variant={statusBadgeMap[vuln.status] || "secondary"}>
                                  {t(`status.${vuln.status}`)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {vuln.cweId} · {t(`scanModule.${vuln.module}`)} · {vuln.affectedEndpoint}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      <div
                        className={`grid transition-all duration-300 ${
                          isExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-border px-5 py-5">
                            <div className="grid gap-6 md:grid-cols-2">
                              <div>
                                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  {t("scanDetail.description")}
                                </h4>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {vuln.description}
                                </p>

                                <h4 className="mt-5 flex items-center gap-1.5 text-sm font-semibold">
                                  <Globe className="h-4 w-4 text-primary" />
                                  {t("scanDetail.evidence")}
                                </h4>
                                <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-muted-foreground">
                                  {vuln.evidence}
                                </pre>
                              </div>

                              <div>
                                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                                  <Lock className="h-4 w-4 text-emerald-500" />
                                  {t("scanDetail.recommendation")}
                                </h4>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {vuln.recommendation}
                                </p>

                                {vuln.cveIds && vuln.cveIds.length > 0 && (
                                  <div className="mt-5 rounded-md border border-border bg-background p-3">
                                    <p className="text-xs font-medium text-muted-foreground">CVEs:</p>
                                    <p className="mt-1 font-mono text-xs">{vuln.cveIds.join(", ")}</p>
                                  </div>
                                )}

                                <div className="mt-5 rounded-md border border-border bg-background p-3">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{t("scanDetail.confidence")}: {vuln.confidence}</span>
                                    <span>
                                      {new Date(vuln.createdAt).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <ListChecks className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {t("vulnerabilities.selectedCount", { count: selectedIds.size })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                {t("vulnerabilities.clearSelection")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setPlanTitle(generatePlanTitle);
                  setShowPlanModal(true);
                }}
              >
                <ListChecks className="h-4 w-4" />
                {t("vulnerabilities.createPlan")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("remediationPlans.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("remediationPlans.createDescription", { count: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("remediationPlans.nameLabel")}</label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder={t("remediationPlans.namePlaceholder")}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("remediationPlans.descriptionLabel")}</label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder={t("remediationPlans.descriptionPlaceholder")}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t("remediationPlans.selectedVulnerabilities")}
              </p>
              <p className="mt-1 text-sm">
                {selectedIds.size} {t("remediationPlans.vulnerabilities").toLowerCase()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPlanModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!planTitle.trim() || creatingPlan}
            >
              {creatingPlan && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("remediationPlans.createButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function pillClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
  }`;
}

function severityIconClass(sev: string) {
  switch (sev) {
    case "critical":
      return "bg-red-500/10 text-red-500";
    case "high":
      return "bg-rose-500/10 text-rose-500";
    case "medium":
      return "bg-amber-500/10 text-amber-500";
    case "low":
      return "bg-emerald-500/10 text-emerald-500";
    default:
      return "bg-muted text-muted-foreground";
  }
}
