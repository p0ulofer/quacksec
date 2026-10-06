"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Globe,
  Code2,
  Package,
  Settings,
  ArrowRight,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function LandingPage() {
  const t = useTranslations();
  const [scanUrl, setScanUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ id: string; status: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const modules = [
    {
      icon: Globe,
      title: t("modules.webScanner.title"),
      description: t("modules.webScanner.description"),
      features: [t("modules.webScanner.features.0"), t("modules.webScanner.features.1"), t("modules.webScanner.features.2")],
    },
    {
      icon: Code2,
      title: t("modules.apiScanner.title"),
      description: t("modules.apiScanner.description"),
      features: [t("modules.apiScanner.features.0"), t("modules.apiScanner.features.1"), t("modules.apiScanner.features.2")],
    },
    {
      icon: Package,
      title: t("modules.dependencyAnalysis.title"),
      description: t("modules.dependencyAnalysis.description"),
      features: [t("modules.dependencyAnalysis.features.0"), t("modules.dependencyAnalysis.features.1"), t("modules.dependencyAnalysis.features.2")],
    },
    {
      icon: Settings,
      title: t("modules.configAudit.title"),
      description: t("modules.configAudit.description"),
      features: [t("modules.configAudit.features.0"), t("modules.configAudit.features.1"), t("modules.configAudit.features.2")],
    },
  ];

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
    } catch {
      setScanError(t("landing.scanError"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/30 blur-[100px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
            <div className="mx-auto max-w-3xl text-center">


              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl leading-[1.05] tracking-tight md:text-7xl"
              >
                {t("landing.heroTitle1")}{" "}
                <span className="italic text-primary">{t("landing.heroTitle2")}</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              >
                {t("landing.heroDescription")}{" "}
                <span className="font-medium text-foreground">
                  {t("landing.heroHighlight")}
                </span>
                .
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    {t("landing.viewDashboard")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="/vulnerabilidades">
                    {t("landing.viewVulnerabilities")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Scan Form */}
        <section id="scan" className="border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="default" className="mb-4 gap-1.5">
                <Search className="h-3.5 w-3.5" />
                {t("landing.scanTitle")}
              </Badge>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                {t("landing.scanHeading")}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {t("landing.scanDescription")}
              </p>
            </Reveal>

            <Reveal className="mx-auto mt-8 max-w-xl" delay={0.1}>
              <form onSubmit={handleScan} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    placeholder={t("landing.scanPlaceholder")}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={scanning}
                    required
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
                        href={`/scans/${scanResult.id}`}
                        className="font-medium underline"
                      >
                        {t("common.viewResult")}
                      </Link>
                    </p>
                  </div>
                )}
              </form>
            </Reveal>
          </div>
        </section>

        {/* Módulos */}
        <section className="border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">
                {t("landing.modulesTitle")}
              </Badge>
              <h2 className="text-4xl tracking-tight md:text-5xl">
                {t("landing.modulesHeading")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landing.modulesDescription")}
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {modules.map((mod, i) => (
                <Reveal key={mod.title} delay={i * 0.1}>
                  <ModuleCard {...mod} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <Reveal className="mx-auto max-w-3xl text-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12">
                <ShieldCheck className="mx-auto h-10 w-10 text-primary" strokeWidth={1.6} />
                <h2 className="mt-6 text-4xl tracking-tight md:text-5xl">
                  {t("landing.ctaTitle1")}{" "}
                  <span className="italic text-primary">{t("landing.ctaTitle2")}</span>.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                  {t("landing.ctaDescription")}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      {t("landing.openDashboard")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/vulnerabilidades">{t("landing.viewVulnerabilities")}</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="group h-full rounded-lg border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </div>
      <h3 className="mt-5 text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary/70" strokeWidth={1.6} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
