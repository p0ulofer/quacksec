"use client";

import { useState, useEffect, useMemo } from "react";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
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
} from "lucide-react";
import { api, Vulnerability } from "@/lib/api";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type VulnStatus = "open" | "confirmed" | "false_positive" | "fixed";

const severityConfig: Record<Severity, { label: string; badge: "critical" | "danger" | "warning" | "success" | "secondary" }> = {
  critical: { label: "Crítico", badge: "critical" },
  high: { label: "Alto", badge: "danger" },
  medium: { label: "Médio", badge: "warning" },
  low: { label: "Baixo", badge: "success" },
  info: { label: "Info", badge: "secondary" },
};

const statusConfig: Record<VulnStatus, { label: string; badge: "critical" | "success" | "warning" | "secondary" }> = {
  open: { label: "Em aberto", badge: "critical" },
  confirmed: { label: "Confirmado", badge: "warning" },
  false_positive: { label: "Falso positivo", badge: "secondary" },
  fixed: { label: "Corrigido", badge: "success" },
};

export default function VulnerabilidadesPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<VulnStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    return vulns.filter((v) => {
      const matchesSearch =
        search === "" ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description?.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || v.severity === severityFilter;
      const matchesStatus =
        statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [vulns, search, severityFilter, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: vulns.length };
    for (const v of vulns) {
      c[v.severity] = (c[v.severity] ?? 0) + 1;
    }
    return c;
  }, [vulns]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl tracking-tight">Vulnerabilidades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? (
              "Carregando..."
            ) : (
              <>
                {vulns.length} resultados encontrados ·{" "}
                {vulns.filter((v) => v.severity === "critical").length} críticas ·{" "}
                {vulns.filter((v) => v.status === "open").length} em aberto
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Carregando vulnerabilidades...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <Reveal>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar vulnerabilidades..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Severidade:
                  </span>
                  <button
                    onClick={() => setSeverityFilter("all")}
                    className={pillClass(severityFilter === "all")}
                  >
                    Todas ({counts.all})
                  </button>
                  {(Object.keys(severityConfig) as Severity[]).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={pillClass(severityFilter === sev)}
                    >
                      {severityConfig[sev].label} ({counts[sev] ?? 0})
                    </button>
                  ))}

                  <span className="ml-4 text-xs font-medium text-muted-foreground">
                    Status:
                  </span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={pillClass(statusFilter === "all")}
                  >
                    Todos
                  </button>
                  {(Object.keys(statusConfig) as VulnStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={pillClass(statusFilter === s)}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* List */}
            <div className="mt-6 space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-border py-20 text-center">
                  <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhuma vulnerabilidade encontrada com esses filtros.
                  </p>
                </div>
              )}
              {filtered.map((vuln, i) => {
                const isExpanded = expandedId === vuln.id;
                return (
                  <Reveal key={vuln.id} delay={Math.min(i * 0.04, 0.24)}>
                    <div
                      className={`overflow-hidden rounded-lg border bg-card transition-all duration-300 ${
                        isExpanded
                          ? "border-primary/40 shadow-md"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : vuln.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${severityIconClass(vuln.severity)}`}
                          >
                            <Bug className="h-5 w-5" strokeWidth={1.6} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{vuln.title}</span>
                              <Badge variant={severityConfig[vuln.severity]?.badge || "secondary"}>
                                {severityConfig[vuln.severity]?.label || vuln.severity}
                              </Badge>
                              <Badge variant={statusConfig[vuln.status]?.badge || "secondary"}>
                                {statusConfig[vuln.status]?.label || vuln.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {vuln.cweId} · {vuln.module} · {vuln.affectedEndpoint}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

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
                                  Descrição
                                </h4>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {vuln.description}
                                </p>

                                <h4 className="mt-5 flex items-center gap-1.5 text-sm font-semibold">
                                  <Globe className="h-4 w-4 text-primary" />
                                  Evidência
                                </h4>
                                <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-muted-foreground">
                                  {vuln.evidence}
                                </pre>
                              </div>

                              <div>
                                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                                  <Lock className="h-4 w-4 text-emerald-500" />
                                  Recomendação
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
                                    <span>Confiança: {vuln.confidence}</span>
                                    <span>
                                      {new Date(vuln.createdAt).toLocaleDateString("pt-BR")}
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
