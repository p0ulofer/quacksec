"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Flame,
} from "lucide-react";
import { api, RemediationPlan } from "@/lib/api";

type PlanStatus = "open" | "in_progress" | "done";

const planStatusConfig: Record<PlanStatus, { badge: "critical" | "warning" | "success"; icon: React.ReactNode }> = {
  open: { badge: "critical", icon: <AlertTriangle className="h-4 w-4" /> },
  in_progress: { badge: "warning", icon: <Clock className="h-4 w-4" /> },
  done: { badge: "success", icon: <CheckCircle2 className="h-4 w-4" /> },
};

export default function RemediationPlansPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [plans, setPlans] = useState<RemediationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .getRemediationPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteRemediationPlan(deleteId);
      setPlans((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const highestSeverity = (plan: RemediationPlan) => {
    const order = ["critical", "high", "medium", "low", "info"];
    for (const sev of order) {
      if (plan.vulnerabilities.some((pv) => pv.vulnerability.severity === sev)) {
        return sev;
      }
    }
    return "info";
  };

  const sevBadgeMap: Record<string, "critical" | "danger" | "warning" | "success" | "secondary"> = {
    critical: "critical",
    high: "danger",
    medium: "warning",
    low: "success",
    info: "secondary",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl tracking-tight">{t("remediationPlans.title")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? t("common.loading")
                  : t("remediationPlans.plansCount", { count: plans.length })}
              </p>
            </div>
            <Link href={`/${locale}/vulnerabilidades`}>
              <Button variant="outline" size="sm">
                {t("remediationPlans.goToVulnerabilities")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("remediationPlans.noPlans")}
            </p>
            <Link href={`/${locale}/vulnerabilidades`}>
              <Button variant="outline" size="sm" className="mt-4">
                {t("remediationPlans.goToVulnerabilities")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => {
              const topSev = highestSeverity(plan);
              const resolvedCount = plan.vulnerabilities.filter(
                (pv) => pv.status !== "pending"
              ).length;
              const totalCount = plan.vulnerabilities.length;
              const status = plan.status as PlanStatus;
              const config = planStatusConfig[status];

              return (
                <Reveal key={plan.id} delay={Math.min(i * 0.05, 0.3)}>
                  <Link href={`/${locale}/vulnerabilidades/planos/${plan.id}`}>
                    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                      <div className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              status === "done"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : status === "in_progress"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {config.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{plan.title}</span>
                              <Badge variant={config.badge}>
                                {t(`remediationPlanStatus.${status}`)}
                              </Badge>
                              <Badge variant={sevBadgeMap[topSev]}>
                                {t(`severity.${topSev}`)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {resolvedCount}/{totalCount} {t("remediationPlans.vulnerabilities").toLowerCase()} ·{" "}
                              {new Date(plan.createdAt).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                              {plan.dueDate && (
                                <>
                                  {" · "}{t("remediationPlans.dueDate")}:{" "}
                                  {new Date(plan.dueDate).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US")}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteId(plan.id);
                            }}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("remediationPlans.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("remediationPlans.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("remediationPlans.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
