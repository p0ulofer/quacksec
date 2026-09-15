"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Loader2,
  ChevronLeft,
  Bug,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { api, RemediationPlan, RemediationPlanVuln } from "@/lib/api";

type PlanStatus = "open" | "in_progress" | "done";
type VulnPlanStatus = "pending" | "resolved" | "false_positive" | "risk_accepted";

const severityBadgeMap: Record<string, "critical" | "danger" | "warning" | "success" | "secondary"> = {
  critical: "critical",
  high: "danger",
  medium: "warning",
  low: "success",
  info: "secondary",
};

export default function PlanDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<RemediationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState<{ vulnId: string; vulnTitle: string } | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolveType, setResolveType] = useState<"resolved" | "false_positive" | "risk_accepted">("resolved");
  const [resolving, setResolving] = useState(false);
  const [completingPlan, setCompletingPlan] = useState(false);

  useEffect(() => {
    api
      .getRemediationPlan(planId)
      .then(setPlan)
      .catch(() => router.push(`/${locale}/vulnerabilidades/planos`))
      .finally(() => setLoading(false));
  }, [planId, router, locale]);

  const handleResolveVuln = async () => {
    if (!resolveModal || !plan) return;
    setResolving(true);
    try {
      const updated = await api.updatePlanVulnerabilityStatus(plan.id, resolveModal.vulnId, {
        status: resolveType,
        resolutionNote: resolveNote.trim() || undefined,
      });
      setPlan(updated);
      setResolveModal(null);
      setResolveNote("");
      setResolveType("resolved");
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const handleCompletePlan = async () => {
    if (!plan) return;
    setCompletingPlan(true);
    try {
      const updated = await api.updateRemediationPlan(plan.id, { status: "done" });
      setPlan(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingPlan(false);
    }
  };

  const planStatusConfig: Record<PlanStatus, { badge: "critical" | "warning" | "success"; label: string }> = {
    open: { badge: "critical", label: t("remediationPlanStatus.open") },
    in_progress: { badge: "warning", label: t("remediationPlanStatus.in_progress") },
    done: { badge: "success", label: t("remediationPlanStatus.done") },
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const status = plan.status as PlanStatus;
  const config = planStatusConfig[status];
  const resolvedCount = plan.vulnerabilities.filter((pv) => pv.status !== "pending").length;
  const totalCount = plan.vulnerabilities.length;
  const allResolved = resolvedCount === totalCount;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href={`/${locale}/vulnerabilidades/planos`}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("remediationPlans.backToList")}
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl tracking-tight">{plan.title}</h1>
              {plan.description && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={config.badge}>{config.label}</Badge>
                <span className="text-xs text-muted-foreground">
                  {resolvedCount}/{totalCount} {t("remediationPlans.vulnerabilities").toLowerCase()} ·{" "}
                  {t("remediationPlans.createdAt")}{" "}
                  {new Date(plan.createdAt).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                </span>
              </div>
            </div>
            {status !== "done" && (
              <Button
                onClick={handleCompletePlan}
                disabled={completingPlan}
                variant={allResolved ? "default" : "outline"}
                size="sm"
              >
                {completingPlan && <Loader2 className="h-4 w-4 animate-spin" />}
                <ShieldCheck className="h-4 w-4" />
                {t("remediationPlans.markAsDone")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {plan.vulnerabilities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center">
            <Bug className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("remediationPlans.noVulnerabilities")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.vulnerabilities.map((pv, i) => {
              const isResolved = pv.status !== "pending";
              return (
                <Reveal key={pv.id} delay={Math.min(i * 0.04, 0.24)}>
                  <div
                    className={`overflow-hidden rounded-lg border bg-card transition-all duration-300 ${
                      isResolved
                        ? "border-emerald-500/20 opacity-75"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isResolved
                              ? "bg-emerald-500/10 text-emerald-500"
                              : severityIconClass(pv.vulnerability.severity)
                          }`}
                        >
                          {isResolved ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Bug className="h-5 w-5" strokeWidth={1.6} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-medium ${isResolved ? "line-through text-muted-foreground" : ""}`}>
                              {pv.vulnerability.title}
                            </span>
                            <Badge variant={severityBadgeMap[pv.vulnerability.severity] || "secondary"}>
                              {t(`severity.${pv.vulnerability.severity}`)}
                            </Badge>
                            {isResolved && (
                              <Badge variant="success">
                                {t(`planVulnStatus.${pv.status}`)}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {pv.vulnerability.cweId} · {pv.vulnerability.affectedEndpoint}
                            {pv.resolvedAt && (
                              <>
                                {" · "}{t("remediationPlans.resolvedAt")}{" "}
                                {new Date(pv.resolvedAt).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                              </>
                            )}
                          </p>
                          {pv.resolutionNote && (
                            <p className="mt-1 text-xs text-muted-foreground italic">
                              {pv.resolutionNote}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isResolved && status !== "done" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setResolveModal({
                              vulnId: pv.vulnerabilityId,
                              vulnTitle: pv.vulnerability.title,
                            })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {t("remediationPlans.resolve")}
                        </Button>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!resolveModal} onOpenChange={() => setResolveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("remediationPlans.resolveTitle")}</DialogTitle>
            <DialogDescription>
              {resolveModal?.vulnTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("remediationPlans.resolutionType")}</label>
              <div className="flex gap-2">
                {(["resolved", "false_positive", "risk_accepted"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setResolveType(type)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      resolveType === type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {t(`planVulnStatus.${type}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("remediationPlans.resolutionNote")}</label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder={t("remediationPlans.resolutionNotePlaceholder")}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResolveModal(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleResolveVuln} disabled={resolving}>
              {resolving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("remediationPlans.confirmResolve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
