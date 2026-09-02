import Link from "next/link";
import { ShieldCheck, ExternalLink, Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <ShieldCheck
                className="h-6 w-6 text-primary"
                strokeWidth={1.8}
              />
              <span className="font-serif text-xl tracking-tight">
                QuackSec
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Segurança que ensina. Encontre vulnerabilities, compreenda por que
              elas existem e aprenda a corrigir — tudo em uma plataforma só.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold">Plataforma</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/vulnerabilidades"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Vulnerabilidades
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold">Documentação</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Guia de scanners
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  CWE & OWASP
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Começando
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 QuackSec. Projeto educacional.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Documentação"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Site"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
