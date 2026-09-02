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
import { Reveal } from "@/components/ui/reveal";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const modules = [
  {
    icon: Globe,
    title: "Scanner Web",
    description:
      "Analisa aplicações web em busca de XSS, SQLi, CSRF, misconfigurations e outras falhas do OWASP Top 10.",
    features: ["XSS & Injection", "Headers de segurança", "Controle de acesso"],
  },
  {
    icon: Code2,
    title: "Scanner de API",
    description:
      "Testa endpoints REST e GraphQL: autenticação, autorização, validação de input e exposição de dados.",
    features: ["BOLA / IDOR", "Mass assignment", "Rate limiting"],
  },
  {
    icon: Package,
    title: "Análise de Dependências",
    description:
      "Mapeia bibliotecas e pacotes do seu projeto, cruzando com CVEs e bases de vulnerabilidades conhecidas.",
    features: ["CVE matching", "Licenças", "SBOM"],
  },
  {
    icon: Settings,
    title: "Configuração",
    description:
      "Audita configurações de servidor, TLS/SSL, headers HTTP, barramentos e hardening do ambiente.",
    features: ["TLS score", "Security headers", "Hardening"],
  },
];

export default function LandingPage() {
  const [scanUrl, setScanUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ id: string; status: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

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
    } catch (err) {
      setScanError("Erro ao criar scan. Verifique se o backend está rodando.");
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
                Segurança que{" "}
                <span className="italic text-primary">ensina</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              >
                O QuackSec escaneia suas aplicações e APIs em busca de
                vulnerabilidades — e, em vez de apenas apontar o problema,{" "}
                <span className="font-medium text-foreground">
                  explica por que ele existe e como corrigir
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
                    Ver dashboard
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
                    Ver vulnerabilidades
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Hero visual: mini dashboard ilustrativo */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-20 max-w-3xl"
            >
              <MiniDashboardPreview />
            </motion.div>
          </div>
        </section>

        {/* Scan Form */}
        <section id="scan" className="border-t border-border/40">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="default" className="mb-4 gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Iniciar scan
              </Badge>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                Escaneie sua aplicação agora
              </h2>
              <p className="mt-3 text-muted-foreground">
                Insira a URL da sua aplicação e o QuackSec irá analisar automaticamente
                vulnerabilidades, dependências e configurações de segurança.
              </p>
            </Reveal>

            <Reveal className="mx-auto mt-8 max-w-xl" delay={0.1}>
              <form onSubmit={handleScan} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    placeholder="https://exemplo.com"
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
                        Escanear
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
                      Scan criado com sucesso!{" "}
                      <Link
                        href={`/scans/${scanResult.id}`}
                        className="font-medium underline"
                      >
                        Ver resultado
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
                Módulos do scanner
              </Badge>
              <h2 className="text-4xl tracking-tight md:text-5xl">
                Quatro lentes. Uma visão completa.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cada módulo cobre uma camada diferente do seu sistema — do
                frontend às dependências — com foco em didática.
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
                  Comece a enxergar como um{" "}
                  <span className="italic text-primary">atacante</span>.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                  Conecte seu projeto, rode um scan e transforme cada alerta em
                  uma lição. Sem mágica — só clareza.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Abrir dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/vulnerabilidades">Ver vulnerabilidades</Link>
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

function MiniDashboardPreview() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <span className="font-serif text-6xl text-primary">7.2</span>
        <span className="ml-1 text-sm text-muted-foreground">/10</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>14 vulnerabilidades</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>7 apps monitorados</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>Último scan há 2 min</span>
      </div>
    </div>
  );
}
