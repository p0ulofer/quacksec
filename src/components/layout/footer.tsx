"use client";

import Link from "next/link";
import { ShieldCheck, ExternalLink, Globe, Mail } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <ShieldCheck
                className="h-6 w-6 text-primary"
                strokeWidth={1.8}
              />
              <span className="font-serif text-xl tracking-tight">
                QuackSec
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold">{t("footer.platform")}</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/vulnerabilidades`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.vulnerabilities")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold">{t("footer.documentation")}</h4>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.scannerGuide")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.cweOwasp")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.gettingStarted")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("footer.docsAria")}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("footer.siteAria")}
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("footer.emailAria")}
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
