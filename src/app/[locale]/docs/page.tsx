"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  Shield,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Server,
  FileText,
  Terminal,
  AlertTriangle,
  Cpu,
  Layers,
  Lock,
  Code2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Hash,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Flame,
  Info,
  Zap,
  Activity,
  CheckCircle,
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  category: string;
}

export default function DocsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const isEn = locale === "en";

  const [activeSection, setActiveSection] = useState("visao-geral");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const navCategories = useMemo(() => [
    {
      category: isEn ? "Getting Started" : "Primeiros Passos",
      items: [
        { id: "visao-geral", title: isEn ? "Overview & Philosophy" : "Visão Geral e Filosofia" },
        { id: "como-funciona", title: isEn ? "How QuackSec Works" : "Como Funciona o QuackSec" },
        { id: "cadastro-ativacao", title: isEn ? "Account & Email Verification" : "Cadastro e Verificação de E-mail" },
      ],
    },
    {
      category: isEn ? "Domain Verification" : "Validação de Domínio",
      items: [
        { id: "por-que-validar", title: isEn ? "Why Verification is Required" : "Por que é Obrigatório Validar?" },
        { id: "validacao-dns", title: isEn ? "Method 1: DNS Record (TXT)" : "Método 1: Registro DNS (TXT)" },
        { id: "validacao-arquivo", title: isEn ? "Method 2: File (.well-known)" : "Método 2: Arquivo (.well-known)" },
        { id: "regras-cobertura", title: isEn ? "Apex vs Subdomains Coverage" : "Apex, Subdomínios e Ciclo de Vida" },
      ],
    },
    {
      category: isEn ? "Scan Engines" : "Serviços de Scan",
      items: [
        { id: "motores-scan", title: isEn ? "Engines Overview" : "Visão Geral dos Scanners" },
        { id: "modulo-api", title: isEn ? "API Scanner" : "API Scanner" },
        { id: "modulo-config", title: isEn ? "Configuration Analyzer" : "Analisador de Configurações" },
        { id: "modulo-dependencias", title: isEn ? "Dependency & SCA Analyzer" : "Análise de Dependências (SCA)" },
        { id: "modulo-nuclei", title: isEn ? "Nuclei Security Scanner" : "Nuclei Security Scanner" },
      ],
    },
    {
      category: isEn ? "Understanding Results" : "Dados & Resultados do Scan",
      items: [
        { id: "estrutura-resultado", title: isEn ? "Scan Metrics & Score" : "Métricas e Pontuação de Segurança" },
        { id: "campos-vulnerabilidade", title: isEn ? "Vulnerability Fields" : "Campos de Cada Vulnerabilidade" },
        { id: "exemplos-resultados", title: isEn ? "Real Result Examples" : "Exemplos Práticos de Resultados" },
      ],
    },
    {
      category: isEn ? "Remediation & AI" : "Correção e Planos com IA",
      items: [
        { id: "planos-remediacao", title: isEn ? "Remediation Plans" : "Planos de Correção" },
        { id: "ia-educacional", title: isEn ? "Educational AI Insights" : "Inteligência Artificial Educativa" },
      ],
    },
    {
      category: isEn ? "FAQ & Best Practices" : "FAQ e Melhores Práticas",
      items: [
        { id: "faq", title: isEn ? "Frequently Asked Questions" : "Perguntas Frequentes" },
        { id: "boas-praticas", title: isEn ? "Security Checklist" : "Checklist de Segurança" },
      ],
    },
  ], [isEn]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return navCategories;
    const q = searchQuery.toLowerCase();
    return navCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.title.toLowerCase().includes(q) || cat.category.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [navCategories, searchQuery]);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Docs Header / Hero Banner */}
      <div className="border-b border-border/60 bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary gap-1 px-2.5 py-0.5 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                {isEn ? "QuackSec Knowledge Base" : "Base de Conhecimento QuackSec"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">v1.0 (ASPM)</span>
            </div>
            <h1 className="text-3xl font-serif tracking-tight md:text-4xl">
              {isEn ? "Platform Documentation" : "Documentação da Plataforma"}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {isEn
                ? "Everything you need to verify domains, run security scans, interpret findings, and fix vulnerabilities with AI-driven guidance."
                : "Tudo o que você precisa saber para validar domínios, executar varreduras, interpretar resultados e corrigir vulnerabilidades com auxílio de Inteligência Artificial."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/${locale}/domains`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                {isEn ? "Manage Domains" : "Gerenciar Domínios"}
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard`}>
              <Button size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                {isEn ? "Go to Dashboard" : "Ir para o Painel"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-10">
          {/* Mobile sidebar toggle button */}
          <div className="fixed bottom-6 right-6 z-40 md:hidden">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-12 w-12 rounded-full shadow-lg"
              size="icon"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Left Sidebar (Desktop & Mobile Drawer) */}
          <aside
            className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-border/70 bg-background/95 p-6 backdrop-blur transition-transform md:static md:z-0 md:h-[calc(100vh-8rem)] md:w-64 md:transform-none md:border-r-0 md:bg-transparent md:p-0 md:backdrop-blur-none ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div className="sticky top-24 flex h-full flex-col space-y-4">
              {/* Search filter */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isEn ? "Filter topics..." : "Filtrar tópicos..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Navigation tree */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm">
                {filteredCategories.map((group, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {group.category}
                    </h3>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => scrollTo(item.id)}
                              className={`group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                                isActive
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              }`}
                            >
                              <span className="truncate">{item.title}</span>
                              {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="min-w-0 flex-1 space-y-16 pb-20">
            {/* 1. Visão Geral */}
            <section id="visao-geral" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                {isEn ? "Getting Started" : "Primeiros Passos"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "1. Overview & Philosophy" : "1. Visão Geral e Filosofia"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                O <strong>QuackSec</strong> é uma solução completa de <strong>Application Security Posture Management (ASPM)</strong> desenvolvida para democratizar e desmistificar a segurança de aplicações web e APIs. Ao contrário de ferramentas que apenas despejam listas intermináveis de alertas alarmantes, o QuackSec opera sob o lema <em>"Segurança que ensina"</em>.
              </p>

              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">Postura Proativa</h3>
                  <p className="text-xs text-muted-foreground">
                    Audita aplicações em execução por meio de abordagens não-invasivas e simulações seguras de testes de segurança.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">Inteligência Educativa</h3>
                  <p className="text-xs text-muted-foreground">
                    Cada vulnerabilidade é acompanhada por uma explicação clara do impacto e exemplos reais de código para correção imediata.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">Segurança Ética</h3>
                  <p className="text-xs text-muted-foreground">
                    Verificação rigorosa de autorização de alvos para garantir que apenas proprietários legítimos possam escanear seus sistemas.
                  </p>
                </div>
              </div>
            </section>

            {/* Como Funciona */}
            <section id="como-funciona" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {isEn ? "How QuackSec Works: Step-by-Step Flow" : "Como Funciona o QuackSec: Fluxo Passo a Passo"}
              </h2>
              <p className="text-sm text-muted-foreground">
                O ciclo de uso da plataforma foi pensado para ser ágil e intuitivo, desde o cadastro até a remediação das falhas:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    step: "01",
                    title: "Cadastro & Confirmação de E-mail",
                    desc: "Crie sua conta e confirme a autenticidade do seu e-mail através do código numérico de 6 dígitos enviado para sua caixa de entrada.",
                  },
                  {
                    step: "02",
                    title: "Cadastro e Validação do Domínio",
                    desc: "Adicione o domínio da sua aplicação e comprove a propriedade via registro DNS TXT ou publicação de arquivo em /.well-known.",
                  },
                  {
                    step: "03",
                    title: "Execução do Scan Personalizado",
                    desc: "Inicie uma varredura selecionando os motores de análise desejados (API Scanner, Headers de Configuração, Dependências ou Nuclei).",
                  },
                  {
                    step: "04",
                    title: "Análise do Security Score & Relatórios",
                    desc: "Consulte o cálculo da pontuação de segurança, visualize evidências técnicas sem ruído e classifique os riscos por severidade.",
                  },
                  {
                    step: "05",
                    title: "Criação de Planos de Correção com IA",
                    desc: "Agrupe vulnerabilidades em planos de ação colaborativos com suporte a sugestões de código fornecidas por Inteligência Artificial.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg border border-border bg-card/60 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold text-foreground">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cadastro e Ativação */}
            <section id="cadastro-ativacao" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {isEn ? "Account Registration & 6-Digit Verification" : "Cadastro e Verificação de E-mail (Código de 6 Dígitos)"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Para manter a integridade da plataforma e mitigar abusos, o QuackSec utiliza um mecanismo seguro de confirmação de e-mail antes de liberar ações sensíveis:
              </p>

              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 text-xs leading-relaxed">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Código de Uso Único
                </div>
                <p className="text-muted-foreground">
                  Ao criar sua conta, um código numérico de 6 dígitos é enviado para o seu e-mail cadastrado. Esse código tem validade de <strong>10 minutos</strong> e permite até 5 tentativas.
                </p>
                <div className="flex items-center gap-2 text-foreground font-medium pt-1">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Ações Protegidas
                </div>
                <p className="text-muted-foreground">
                  Enquanto seu e-mail não estiver validado, um banner discreto permanecerá visível nas páginas do painel, e as ações de adicionar domínios e executar scans ficarão pausadas até a confirmação.
                </p>
              </div>
            </section>

            {/* 2. Validação de Domínio */}
            <section id="por-que-validar" className="scroll-mt-24 space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <Globe className="h-4 w-4" />
                {isEn ? "Domain Authorization" : "Autorização de Alvos"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "2. Domain Verification Guide" : "2. Guia Completo de Validação de Domínio"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No QuackSec, <strong>nenhuma varredura pode ser iniciada contra um host sem que você comprove que é o proprietário legítimo</strong> daquele domínio ou servidor. Essa proteção elimina riscos de uso indevido da plataforma para testes não autorizados contra terceiros.
              </p>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs space-y-2 text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 font-medium">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Regra do Domínio Apex
                </div>
                <p className="text-blue-800/80 dark:text-blue-300">
                  Ao validar o domínio raiz (apex, ex: <code>meusite.com</code>) através do método <strong>DNS (TXT)</strong>, todos os subdomínios vinculados (ex: <code>api.meusite.com</code>, <code>staging.meusite.com</code>, <code>app.meusite.com</code>) tornam-se automaticamente autorizados para scan!
                </p>
              </div>
            </section>

            {/* Validação DNS TXT */}
            <section id="validacao-dns" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                {isEn ? "Method 1: DNS TXT Record (Recommended)" : "Método 1: Registro DNS (TXT) — Recomendado"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Este é o método mais prático e recomendado. Basta adicionar uma entrada do tipo <strong>TXT</strong> na zona DNS do seu provedor de domínio.
              </p>

              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Parâmetros de Configuração
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="rounded border border-border/80 bg-muted/40 p-2.5">
                    <span className="font-semibold text-foreground">Tipo de Registro:</span>
                    <p className="font-mono text-primary font-bold mt-0.5">TXT</p>
                  </div>
                  <div className="rounded border border-border/80 bg-muted/40 p-2.5">
                    <span className="font-semibold text-foreground">Nome / Host:</span>
                    <p className="font-mono text-primary font-bold mt-0.5">_quacksec-challenge</p>
                    <span className="text-[10px] text-muted-foreground">(ou _quacksec-challenge.seudominio.com)</span>
                  </div>
                  <div className="rounded border border-border/80 bg-muted/40 p-2.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Valor / Conteúdo do Registro:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => handleCopy("quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab", "dns-example")}
                      >
                        {copiedKey === "dns-example" ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copiedKey === "dns-example" ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                    <p className="font-mono text-xs text-foreground bg-background p-1.5 rounded mt-1 border border-border/60 overflow-x-auto">
                      quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      * O token específico da sua conta é gerado automaticamente na página Domínios.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Como testar no terminal se a entrada propagou:
                  </h4>
                  <div className="relative rounded-lg bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                      <span>Terminal / Shell</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-neutral-300 hover:text-white"
                        onClick={() => handleCopy("dig TXT _quacksec-challenge.seudominio.com +short", "dns-dig")}
                      >
                        {copiedKey === "dns-dig" ? <Check className="h-3 w-3 text-emerald-400 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        Copiar
                      </Button>
                    </div>
                    <pre className="pt-2 overflow-x-auto">
                      <code>$ dig TXT _quacksec-challenge.seudominio.com +short<br />
<span className="text-emerald-400">"quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab"</span></code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Validação Arquivo .well-known */}
            <section id="validacao-arquivo" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {isEn ? "Method 2: Verification File (.well-known)" : "Método 2: Arquivo de Verificação (.well-known)"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Se você não possui acesso à zona DNS do domínio, pode validar a propriedade servindo um arquivo estático seguro na raiz pública da sua aplicação web.
              </p>

              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-foreground">URL onde o arquivo deve responder:</span>
                  <p className="font-mono bg-muted/60 p-2 rounded text-primary text-xs break-all">
                    https://seudominio.com/.well-known/quacksec-verification.txt
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    O arquivo deve retornar status HTTP <code>200 OK</code> e conter exatamente o token de verificação.
                  </span>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Exemplos de configuração por framework/servidor:
                  </h4>

                  <Tabs defaultValue="nextjs" className="w-full">
                    <TabsList className="h-8">
                      <TabsTrigger value="nextjs" className="text-xs">Next.js</TabsTrigger>
                      <TabsTrigger value="nginx" className="text-xs">Nginx</TabsTrigger>
                      <TabsTrigger value="apache" className="text-xs">Apache (.htaccess)</TabsTrigger>
                      <TabsTrigger value="express" className="text-xs">Express.js</TabsTrigger>
                    </TabsList>

                    <TabsContent value="nextjs" className="pt-2">
                      <div className="rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                        <p className="text-neutral-400 text-[11px] pb-1.5">
                          Crie a pasta e arquivo dentro de <code>public/</code>:
                        </p>
                        <code>public/.well-known/quacksec-verification.txt</code>
                        <div className="mt-2 text-neutral-400 border-t border-neutral-800 pt-2">
                          Conteúdo do arquivo:
                        </div>
                        <code className="text-emerald-400">quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab</code>
                      </div>
                    </TabsContent>

                    <TabsContent value="nginx" className="pt-2">
                      <div className="rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                        <pre className="overflow-x-auto">
{`location /.well-known/quacksec-verification.txt {
    default_type text/plain;
    return 200 "quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab";
}`}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="apache" className="pt-2">
                      <div className="rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                        <p className="text-neutral-400 text-[11px] pb-1.5">
                          Coloque o arquivo diretamente no diretório raiz do Apache:
                        </p>
                        <code>/var/www/html/.well-known/quacksec-verification.txt</code>
                      </div>
                    </TabsContent>

                    <TabsContent value="express" className="pt-2">
                      <div className="rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                        <pre className="overflow-x-auto">
{`app.get('/.well-known/quacksec-verification.txt', (req, res) => {
  res.type('text/plain').send('quacksec-verify=f8a12e34-5678-90ab-cdef-1234567890ab');
});`}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Como validar com cURL no terminal:
                  </h4>
                  <div className="rounded bg-neutral-950 p-2.5 font-mono text-xs text-neutral-200">
                    <code>curl -i https://seudominio.com/.well-known/quacksec-verification.txt</code>
                  </div>
                </div>
              </div>
            </section>

            {/* Regras e Cobertura */}
            <section id="regras-cobertura" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {isEn ? "Coverage Rules, Expiration & Automatic Renewal" : "Regras de Cobertura, Validade e Renovação Automática"}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Validade de 30 Dias
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    A verificação é válida por 30 dias contínuos. Uma rotina automática reverifica periodicamente seu domínio para garantir renovação transparente sem interrupções.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Hosts Públicos & Compartilhados
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Sufixos públicos de hospedagem compartilhada (como <code>*.vercel.app</code> ou <code>*.onrender.com</code>) só podem ser validados via arquivo no subdomínio individual exato.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Motores de Varredura */}
            <section id="motores-scan" className="scroll-mt-24 space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <Cpu className="h-4 w-4" />
                {isEn ? "Scan Modules" : "Módulos de Varredura"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "3. The 4 Security Scan Engines" : "3. Os 4 Motores de Análise de Segurança"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                O QuackSec integra 4 serviços complementares de auditoria que você pode selecionar de forma individual ou combinada em uma única execução:
              </p>
            </section>

            {/* Módulo API Scanner */}
            <section id="modulo-api" className="scroll-mt-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">API Scanner</h3>
                      <p className="text-xs text-muted-foreground font-mono">id do serviço: api_scanner</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary">DAST & API Security</Badge>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Testa ativamente as rotas de API da sua aplicação web para descobrir vulnerabilidades estruturais de comunicação, configurações fracas de endpoints e rotas sensíveis expostas.
                </p>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-foreground">O que este módulo audita:</span>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Métodos HTTP inseguros permitidos no servidor (PUT, DELETE sem autenticação, TRACE).</li>
                    <li>Erros de configuração de <strong>CORS</strong> (origem wildcard <code>*</code> com credenciais ativas).</li>
                    <li>Falta de cabeçalhos de controle de cache em respostas contendo dados sensíveis.</li>
                    <li>Detecção de endpoints comuns desprotegidos (Swagger UI, documentações OpenAPI expostas sem auth, rotas de GraphQL).</li>
                    <li>Validação de parâmetros e cabeçalhos de proteção contra injeções.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Módulo Analisador de Configurações */}
            <section id="modulo-config" className="scroll-mt-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Analisador de Configurações</h3>
                      <p className="text-xs text-muted-foreground font-mono">id do serviço: config_analyzer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400">Security Headers & Posture</Badge>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Inspeciona a postura dos cabeçalhos HTTP, certificados SSL/TLS, políticas de cookies e exposição acidental de arquivos de configuração no servidor web.
                </p>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-foreground">O que este módulo audita:</span>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><strong>Strict-Transport-Security (HSTS)</strong>: Forçamento obrigatório de HTTPS e proteção contra SSL Stripping.</li>
                    <li><strong>Content-Security-Policy (CSP)</strong>: Barreiras robustas contra ataques de Cross-Site Scripting (XSS).</li>
                    <li><strong>X-Frame-Options & X-Content-Type-Options</strong>: Proteções essenciais contra Clickjacking e MIME sniffing.</li>
                    <li><strong>Referrer-Policy & Permissions-Policy</strong>: Restrição de vazamento de dados em navegações externas.</li>
                    <li><strong>Cookies de Sessão</strong>: Verificação das flags <code>Secure</code>, <code>HttpOnly</code> e <code>SameSite</code>.</li>
                    <li><strong>Arquivos Críticos Expostos</strong>: Procura por arquivos <code>.env</code>, pastas <code>.git</code>, backups (<code>dump.sql</code>, <code>.bak</code>) e arquivos de depuração.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Módulo Análise de Dependências */}
            <section id="modulo-dependencias" className="scroll-mt-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Análise de Dependências (SCA)</h3>
                      <p className="text-xs text-muted-foreground font-mono">id do serviço: dependency_analyzer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">Software Composition Analysis</Badge>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Identifica componentes de software de terceiros, bibliotecas JavaScript e frameworks em execução na aplicação, correlacionando suas versões contra bases públicas de CVE.
                </p>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-foreground">O que este módulo audita:</span>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Impressões digitais (fingerprints) de bibliotecas frontend (React, jQuery, Lodash, Vue, Angular, Bootstrap).</li>
                    <li>Mapeamento das versões em uso com vulnerabilidades conhecidas cadastradas no National Vulnerability Database (NVD).</li>
                    <li>Recomendações da versão mínima segura e atualizada para mitigar cada falha.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Módulo Nuclei */}
            <section id="modulo-nuclei" className="scroll-mt-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Nuclei Security Scanner</h3>
                      <p className="text-xs text-muted-foreground font-mono">id do serviço: nuclei</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-400">Template-based Scanner</Badge>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Aplica modelos e templates criados e mantidos pela comunidade global de cibersegurança para identificar CVEs recentes, painéis administrativos expostos e configurações arriscadas.
                </p>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-foreground">O que este módulo audita:</span>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Painéis de login e administração expostos à internet pública sem restrição de IP.</li>
                    <li>Assinaturas de falhas conhecidas em servidores web (Apache, Nginx, IIS) e middlewares populares.</li>
                    <li>Exposições acidentais de portas de depuração e endpoints de telemetria.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Dados & Resultados do Scan */}
            <section id="estrutura-resultado" className="scroll-mt-24 space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <Activity className="h-4 w-4" />
                {isEn ? "Scan Output & Data Schema" : "Dados e Resultados do Scan"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "4. Understanding Scan Metrics & Outputs" : "4. Compreendendo as Métricas e Dados Retornados"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Toda execução de varredura consolida dados de alto nível (métricas gerais da aplicação) e dados granulares (cada vulnerabilidade individual). Abaixo explicamos detalhadamente o significado de cada métrica:
              </p>

              {/* Tabela de métricas */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Métricas Globais do Scan
                </div>
                <div className="divide-y divide-border/60 text-xs">
                  <div className="p-4 grid gap-1 sm:grid-cols-3">
                    <span className="font-mono font-semibold text-primary">securityScore (0.0 - 100.0)</span>
                    <span className="sm:col-span-2 text-muted-foreground">
                      Pontuação de saúde e segurança do alvo calculada com base na quantidade e severidade das falhas detectadas. Quanto mais próximo de 100, mais robusta é a postura da aplicação.
                    </span>
                  </div>
                  <div className="p-4 grid gap-1 sm:grid-cols-3">
                    <span className="font-mono font-semibold text-primary">routesTested (número)</span>
                    <span className="sm:col-span-2 text-muted-foreground">
                      Quantidade total de rotas, endpoints e páginas que foram navegadas e auditadas durante a sessão de teste.
                    </span>
                  </div>
                  <div className="p-4 grid gap-1 sm:grid-cols-3">
                    <span className="font-mono font-semibold text-primary">Contadores por Severidade</span>
                    <span className="sm:col-span-2 text-muted-foreground">
                      Totalização instantânea de falhas divididas em: <strong>criticalCount</strong>, <strong>highCount</strong>, <strong>mediumCount</strong>, <strong>lowCount</strong> e <strong>infoCount</strong>.
                    </span>
                  </div>
                  <div className="p-4 grid gap-1 sm:grid-cols-3">
                    <span className="font-mono font-semibold text-primary">status (estado do scan)</span>
                    <span className="sm:col-span-2 text-muted-foreground">
                      Ciclo de vida do scan: <code>PENDING</code> (na fila de espera), <code>RUNNING</code> (em execução ativa), <code>COMPLETED</code> (concluído com sucesso) ou <code>FAILED</code> (caso o alvo esteja inacessível).
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Campos de cada Vulnerabilidade */}
            <section id="campos-vulnerabilidade" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {isEn ? "Detailed Fields of Each Vulnerability" : "Campos Detalhados de Cada Vulnerabilidade"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Cada vulnerabilidade retornada no relatório contém informações precisas para reprodução e remediação:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">title & description</span>
                  <p className="text-muted-foreground">
                    Nome descritivo e sumário técnico explicando exatamente a natureza do problema e o impacto potencial.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">severity (Crítica, Alta, Média, Baixa, Info)</span>
                  <p className="text-muted-foreground">
                    Classificação padronizada no CVSS (Common Vulnerability Scoring System) para priorização eficiente.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">confidence (Alta, Média, Baixa)</span>
                  <p className="text-muted-foreground">
                    Grau de certeza de que o achado é uma vulnerabilidade real e não um falso alarme.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">affectedEndpoint</span>
                  <p className="text-muted-foreground">
                    URL, caminho relativo ou recurso onde a falha foi evidenciada (ex: <code>/api/v1/auth</code>).
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">evidence</span>
                  <p className="text-muted-foreground">
                    Trecho de cabeçalho, código de status ou resposta HTTP que comprova a existência da fraqueza.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">recommendation</span>
                  <p className="text-muted-foreground">
                    Orientação clara de segurança com a melhor prática recomendada pela OWASP para sanar a falha.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">cveIds & cweId</span>
                  <p className="text-muted-foreground">
                    Identificadores globais da indústria (ex: CWE-693 para falhas de cabeçalhos de proteção, CVE para falhas conhecidas).
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <span className="font-mono font-semibold text-primary">status</span>
                  <p className="text-muted-foreground">
                    Estado no ciclo de vida: <code>open</code> (aberta), <code>confirmed</code> (confirmada), <code>false_positive</code> (falso alarme) ou <code>fixed</code> (resolvida).
                  </p>
                </div>
              </div>
            </section>

            {/* Exemplos Práticos de Resultados */}
            <section id="exemplos-resultados" className="scroll-mt-24 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {isEn ? "Real-World Output Examples (by Engine)" : "Exemplos Práticos de Resultados por Serviço"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Abaixo você confere exemplos reais de payload e formato dos dados retornados por cada um dos nossos scanners, sem exposição de nenhum código interno do QuackSec:
                </p>
              </div>

              {/* Exemplo 1: Analisador de Configurações */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-semibold">Exemplo 1: Analisador de Configurações (Security Headers)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleCopy(JSON.stringify(mockConfigResult, null, 2), "json-config")}
                  >
                    {copiedKey === "json-config" ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copiar JSON
                  </Button>
                </div>
                <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-200 overflow-x-auto">
                  <pre><code>{JSON.stringify(mockConfigResult, null, 2)}</code></pre>
                </div>
              </div>

              {/* Exemplo 2: API Scanner */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">Exemplo 2: API Scanner (CORS Inseguro com Credenciais)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleCopy(JSON.stringify(mockApiResult, null, 2), "json-api")}
                  >
                    {copiedKey === "json-api" ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copiar JSON
                  </Button>
                </div>
                <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-200 overflow-x-auto">
                  <pre><code>{JSON.stringify(mockApiResult, null, 2)}</code></pre>
                </div>
              </div>

              {/* Exemplo 3: Análise de Dependências */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold">Exemplo 3: Análise de Dependências (Biblioteca Frontend com CVE)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleCopy(JSON.stringify(mockDependencyResult, null, 2), "json-dep")}
                  >
                    {copiedKey === "json-dep" ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copiar JSON
                  </Button>
                </div>
                <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-200 overflow-x-auto">
                  <pre><code>{JSON.stringify(mockDependencyResult, null, 2)}</code></pre>
                </div>
              </div>

              {/* Exemplo 4: Nuclei Scanner */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-semibold">Exemplo 4: Nuclei Scanner (Endpoint de Depuração Exposto)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleCopy(JSON.stringify(mockNucleiResult, null, 2), "json-nuclei")}
                  >
                    {copiedKey === "json-nuclei" ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copiar JSON
                  </Button>
                </div>
                <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-200 overflow-x-auto">
                  <pre><code>{JSON.stringify(mockNucleiResult, null, 2)}</code></pre>
                </div>
              </div>
            </section>

            {/* 5. Correção e Planos com IA */}
            <section id="planos-remediacao" className="scroll-mt-24 space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                {isEn ? "Remediation & Plans" : "Correção e Planos"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "5. Remediation Plans & Educational AI" : "5. Planos de Correção e Inteligência Artificial"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Descobrir vulnerabilidades é apenas a primeira metade do trabalho. O QuackSec foi desenhado para fechar o ciclo através da criação de <strong>Planos de Correção</strong> colaborativos.
              </p>

              <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-xs">
                <h4 className="font-semibold text-foreground">Como criar e gerenciar um Plano de Correção:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                  <li>Navegue até a página <strong>Vulnerabilidades</strong> no menu superior.</li>
                  <li>Selecione as falhas mais críticas que sua equipe irá priorizar no sprint atual.</li>
                  <li>Clique no botão <strong>Criar Plano de Correção</strong>, defina um título descritivo e uma data de entrega.</li>
                  <li>Acompanhe o progresso de resolução conforme sua equipe aplica os patches no código ou na infraestrutura.</li>
                </ol>
              </div>
            </section>

            {/* IA Educacional */}
            <section id="ia-educacional" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {isEn ? "How the Educational AI Works" : "Como a IA do QuackSec Ajuda na Prática"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Nosso motor de IA traduz termos de segurança densos em explicações amigáveis e fornece snippets de código adaptados ao seu contexto (ex: Nginx, Next.js, Express, Django).
              </p>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2 text-emerald-950 dark:text-emerald-200">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Exemplo de Sugestão de Correção para HSTS Ausente (Next.js):
                </span>
                <div className="rounded bg-neutral-950 p-3 font-mono text-xs text-neutral-200 mt-2">
                  <pre className="overflow-x-auto">
{`// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 6. FAQ & Melhores Práticas */}
            <section id="faq" className="scroll-mt-24 space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-primary text-xs font-mono font-medium uppercase tracking-wider">
                <HelpCircle className="h-4 w-4" />
                {isEn ? "FAQ" : "Perguntas Frequentes"}
              </div>
              <h2 className="text-2xl font-serif tracking-tight md:text-3xl">
                {isEn ? "6. Frequently Asked Questions" : "6. Perguntas Frequentes (FAQ)"}
              </h2>

              <div className="space-y-3 pt-2">
                {[
                  {
                    q: "O scan do QuackSec pode prejudicar ou derrubar minha aplicação em produção?",
                    a: "Não. Todos os scanners operam de modo não-destrutivo (non-destructive testing) e com controle rigoroso de concorrência e taxa de requisições. O objetivo é auditar posturas e respostas públicas, e não aplicar ataques de negação de serviço (DoS).",
                  },
                  {
                    q: "Por que meu domínio não foi validado após adicionar o registro DNS?",
                    a: "Provedores de DNS podem levar de alguns minutos até algumas horas para propagar novos registros TXT mundialmente. Utilize o comando 'dig TXT _quacksec-challenge.seudominio.com +short' no terminal para conferir se seu provedor já está respondendo com o token antes de clicar em Confirmar.",
                  },
                  {
                    q: "Posso escanear URLs locais (ex: localhost ou 127.0.0.1)?",
                    a: "Por motivos éticos e proteções rigorosas contra Server-Side Request Forgery (SSRF), o QuackSec bloqueia endereços de loopback, IPs privados e metadados de nuvem em ambientes produtivos.",
                  },
                  {
                    q: "Quantos domínios posso cadastrar na minha conta?",
                    a: "Por padrão, cada conta de usuário pode gerenciar até 5 domínios verificados simultaneamente. As verificações têm validade de 30 dias com renovação automática periódica.",
                  },
                  {
                    q: "O que significa marcar uma vulnerabilidade como 'Falso Positivo'?",
                    a: "Se sua equipe verificar que um apontamento não oferece risco real no contexto da sua arquitetura, você pode marcar a falha como 'Falso Positivo'. O status será registrado para auditoria e o item não reduzirá a pontuação de segurança do alvo.",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-1.5">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="text-primary font-mono text-xs">Q{i + 1}.</span>
                      {item.q}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Checklist de Segurança */}
            <section id="boas-praticas" className="scroll-mt-24 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {isEn ? "Quick Security Posture Checklist" : "Checklist Rápido de Postura de Segurança"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Recomendações fundamentais para garantir que sua aplicação atinja a pontuação máxima de segurança:
              </p>

              <div className="rounded-lg border border-border bg-card p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Configure cabeçalhos HSTS com pelo menos 1 ano de validade e a flag <code>includeSubDomains</code>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Implemente uma política Content-Security-Policy (CSP) sem a diretiva <code>unsafe-inline</code>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Certifique-se de que nenhum arquivo oculto como <code>.env</code> ou <code>.git</code> esteja acessível via HTTP.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Adicione as flags <code>HttpOnly</code>, <code>Secure</code> e <code>SameSite=Lax</code> em todos os cookies de autenticação.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Mantenha dependências frontend e pacotes NPM auditados e atualizados nas versões estáveis mais recentes.</span>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// Exemplos realistas e limpos de resultado para exibição na documentação
const mockConfigResult = {
  id: "vuln-cfg-01",
  title: "Strict-Transport-Security (HSTS) Header Missing",
  description: "A aplicação não envia o cabeçalho HSTS, permitindo potenciais ataques de downgrade de conexão (SSL Stripping).",
  severity: "high",
  confidence: "high",
  module: "config_analyzer",
  affectedEndpoint: "https://exemplo.com/",
  evidence: "HTTP/1.1 200 OK — Cabeçalho 'Strict-Transport-Security' ausente na resposta.",
  recommendation: "Adicione o cabeçalho 'Strict-Transport-Security: max-age=31536000; includeSubDomains' no servidor web.",
  cveIds: [],
  cweId: "CWE-319",
  status: "open",
};

const mockApiResult = {
  id: "vuln-api-02",
  title: "Permissive CORS Policy with Credentials Allowed",
  description: "O endpoint de API reflete origens arbitrárias com o cabeçalho Access-Control-Allow-Credentials habilitado.",
  severity: "critical",
  confidence: "high",
  module: "api_scanner",
  affectedEndpoint: "https://exemplo.com/api/v1/user/profile",
  evidence: "Origin: https://evil.com -> Access-Control-Allow-Origin: https://evil.com & Access-Control-Allow-Credentials: true",
  recommendation: "Restrinja o cabeçalho Access-Control-Allow-Origin para uma lista estrita de domínios confiáveis.",
  cveIds: [],
  cweId: "CWE-346",
  status: "open",
};

const mockDependencyResult = {
  id: "vuln-dep-03",
  title: "Vulnerable jQuery Version Detected (XSS in jQuery.htmlPrefilter)",
  description: "A versão 3.4.1 do jQuery em execução no cliente possui vulnerabilidade conhecida de Cross-Site Scripting.",
  severity: "medium",
  confidence: "high",
  module: "dependency_analyzer",
  affectedEndpoint: "https://exemplo.com/assets/js/vendor.js",
  evidence: "Identificado 'jQuery v3.4.1' em execução nos scripts carregados pela página.",
  recommendation: "Atualize o pacote jQuery para a versão 3.5.0 ou superior para eliminar a CVE.",
  cveIds: ["CVE-2020-11022", "CVE-2020-11023"],
  cweId: "CWE-79",
  status: "open",
};

const mockNucleiResult = {
  id: "vuln-nuc-04",
  title: "Spring Boot Actuator Endpoints Publicly Exposed",
  description: "Endpoints administrativos e de telemetria foram encontrados acessíveis publicamente sem autenticação.",
  severity: "high",
  confidence: "high",
  module: "nuclei",
  affectedEndpoint: "https://exemplo.com/actuator/env",
  evidence: "GET /actuator/env retornou 200 OK contendo variáveis de ambiente do sistema.",
  recommendation: "Desabilite os endpoints de actuator na internet pública através do application.properties.",
  cveIds: [],
  cweId: "CWE-200",
  status: "open",
};
