"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import {
  ShieldCheck,
  Globe,
  Bug,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Loader2,
  RefreshCw,
  Search,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { api, DashboardStats, Scan } from "@/lib/api";
import { formatScanDuration } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanInput, setShowScanInput] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ id: string; status: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // --- Delete account state ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, scansData] = await Promise.all([
          api.getDashboardStats(),
          api.getScans(),
        ]);
        setStats(statsData);
        setRecentScans(scansData.slice(0, 5));
      } catch (err) {
        setError(t("dashboard.errorApi"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, scansData] = await Promise.all([
        api.getDashboardStats(),
        api.getScans(),
      ]);
      setStats(statsData);
      setRecentScans(scansData.slice(0, 5));
    } catch (err) {
      setError(t("dashboard.errorApi"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;

    setScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const result = await api.createScan(scanUrl);
      setScanResult({ id: result.id, status: result.status });
      setScanUrl("");
      setShowScanInput(false);
      fetchData();
    } catch {
      setScanError(t("dashboard.errorScan"));
    } finally {
      setScanning(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteAccount(deletePassword);
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "refresh_token=; path=/; max-age=0";
      router.push(`/${locale}/login`);
    } catch (err: any) {
      setDeleteError(err?.message || "Não foi possível excluir a conta.");
      setDeleting(false);
    }
  };

  const severityBreakdown = stats
    ? [
        { name: t("severity.critical"), value: stats.criticalCount, fill: "var(--chart-5)" },
        { name: t("severity.high"), value: stats.highCount, fill: "var(--chart-4)" },
        { name: t("severity.medium"), value: stats.mediumCount, fill: "var(--chart-2)" },
        { name: t("severity.low"), value: stats.lowCount, fill: "var(--chart-1)" },
      ].filter((s) => s.value > 0)
    : [];

  const summaryCards = stats
    ? [
        {
          icon: ShieldCheck,
          label: t("dashboard.securityScore"),
          value: String(stats.securityScore),
          suffix: "/10",
          trend: t("dashboard.scansCount", { count: stats.totalScans }),
          trendPositive: stats.securityScore >= 7,
          iconColor: "text-primary bg-primary/10",
        },
        {
          icon: Bug,
          label: t("dashboard.vulnerabilities"),
          value: String(stats.totalVulnerabilities),
          suffix: "",
          trend: t("dashboard.criticalCount", { count: stats.criticalCount }),
          trendPositive: stats.criticalCount === 0,
          iconColor: "text-rose-500 bg-rose-500/10",
        },
        {
          icon: Globe,
          label: t("dashboard.scansPerformed"),
          value: String(stats.totalScans),
          suffix: "",
          trend: t("dashboard.scansTotal"),
          trendPositive: true,
          iconColor: "text-emerald-500 bg-emerald-500/10",
        },
        {
          icon: Package,
          label: t("dashboard.severityBreakdown"),
          value: String(severityBreakdown.length),
          suffix: t("dashboard.categories"),
          trend: t("dashboard.achados", { count: severityBreakdown.reduce((s, v) => s + v.value, 0) }),
          trendPositive: false,
          iconColor: "text-amber-500 bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-3xl tracking-tight">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("dashboard.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("dashboard.refresh")}
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowScanInput(!showScanInput)}
            >
              {showScanInput ? (
                <>
                  <X className="h-4 w-4" />
                  {t("dashboard.close")}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {t("dashboard.newScan")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Scan input inline */}
      {showScanInput && (
        <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <form onSubmit={handleScan} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scanUrl}
                  onChange={(e) => setScanUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={scanning}
                  required
                  autoFocus
                />
                <Button type="submit" disabled={scanning || !scanUrl.trim()}>
                  {scanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      {t("landing.scanButton")}
                    </>
                  )}
                </Button>
              </div>

              {scanError && (
                <p className="text-sm text-red-500">{scanError}</p>
              )}

              {scanResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {t("common.scanCreated")}{" "}
                    <Link
                      href={`/${locale}/scans/${scanResult.id}`}
                      className="font-medium underline"
                    >
                      {t("common.viewResult")}
                    </Link>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchData}
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card, i) => (
                <Reveal key={card.label} delay={i * 0.08}>
                  <SummaryCard {...card} />
                </Reveal>
              ))}
            </div>

            {/* Charts row */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl">{t("dashboard.recentScans")}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("dashboard.recentScansCount", { count: recentScans.length })}
                      </p>
                    </div>
                  </div>
                  {recentScans.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {t("dashboard.noScans")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentScans.map((scan) => (
                        <Link
                          key={scan.id}
                          href={`/${locale}/scans/${scan.id}`}
                          className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-2 w-2 rounded-full ${
                                scan.status === "completed"
                                  ? "bg-emerald-500"
                                  : scan.status === "running"
                                    ? "bg-amber-500 animate-pulse"
                                    : scan.status === "failed"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium truncate max-w-md">
                                {scan.targetUrl}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {t(`status.${scan.status}`)} ·{" "}
                                {scan.totalVulnerabilities} {t("dashboard.vulnerabilitiesCount")}
                                {formatScanDuration(scan.startedAt, scan.completedAt, locale) && (
                                  <> · {formatScanDuration(scan.startedAt, scan.completedAt, locale)}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {scan.securityScore !== null && (
                              <span className="text-sm font-semibold text-primary">
                                {scan.securityScore}/10
                              </span>
                            )}
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl">{t("dashboard.bySeverity")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("dashboard.currentDistribution")}
                  </p>
                  {severityBreakdown.length === 0 ? (
                    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                      {t("dashboard.noSeverityData")}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={severityBreakdown}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {severityBreakdown.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "13px",
                            color: "var(--foreground)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          formatter={(v) => (
                            <span className="text-xs text-muted-foreground">
                              {v}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Urgent risks */}
            {stats && stats.criticalCount > 0 && (
              <Reveal className="mt-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {t("dashboard.urgentRisks")}
                    </h2>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/${locale}/vulnerabilidades`}>
                        {t("dashboard.viewAll")}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.criticalVulnerabilities", {
                      critical: stats.criticalCount,
                      high: stats.highCount,
                    })}
                  </p>
                </div>
              </Reveal>
            )}

            {/* Danger zone */}
            <Reveal className="mt-10">
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-6 dark:border-red-900 dark:bg-red-950/20">
                <h2 className="flex items-center gap-2 text-lg font-medium text-red-700 dark:text-red-400">
                  <Trash2 className="h-5 w-5" />
                  Zona de perigo
                </h2>
                <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
                  Excluir sua conta é uma ação permanente. Todos os seus dados, scans e aplicações cadastradas serão perdidos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Excluir minha conta
                </Button>
              </div>
            </Reveal>
          </>
        )}
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-medium">Confirmar exclusão</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite sua senha atual para confirmar. Essa ação não pode ser desfeita.
            </p>
            <form onSubmit={handleDeleteAccount} className="mt-4 space-y-3">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
                required
                autoFocus
              />
              {deleteError && (
                <p className="text-sm text-red-500">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting || !deletePassword}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  trendPositive,
  iconColor,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  suffix: string;
  trend: string;
  trendPositive: boolean;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-0.5">
        <span className="font-serif text-3xl tracking-tight">{value}</span>
        {suffix && (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
      <p
        className={`mt-1.5 text-xs ${
          trendPositive ? "text-emerald-500" : "text-amber-500"
        }`}
      >
        {trend}
      </p>
    </div>
  );
}