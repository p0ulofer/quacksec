"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { UserProfileDialog } from "@/components/layout/user-profile-dialog";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const t = useTranslations();
  const locale = useLocale();

  const navLinks = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard") },
    { href: `/${locale}/profile`, label: t("nav.profile") },
    { href: `/${locale}/vulnerabilidades`, label: t("nav.vulnerabilities") },
    { href: `/${locale}/vulnerabilidades/planos`, label: t("nav.remediationPlans") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src={isDark ? "/logo-white.png" : "/logo3.png"}
            alt="QuackSec"
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="font-serif text-xl tracking-tight">QuackSec</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {isAuthenticated &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <UserProfileDialog>
                <button className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline">
                  {user?.name}
                </button>
              </UserProfileDialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); window.location.href = `/${locale}`; }}
                className="hidden md:inline-flex"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="hidden md:inline-flex">
                <Button size="sm" variant="ghost">{t("nav.login")}</Button>
              </Link>
              <Link href={`/${locale}/register`} className="hidden md:inline-flex">
                <Button size="sm">{t("nav.register")}</Button>
              </Link>
            </>
          )}
          <button
            className="rounded-lg p-2 transition-colors hover:bg-accent md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-80" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {isAuthenticated &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          {isAuthenticated ? (
            <>
              <UserProfileDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 justify-start"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
              </UserProfileDialog>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 justify-start"
                onClick={() => {
                  logout();
                  window.location.href = `/${locale}`;
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)}>
                <Button size="sm" variant="ghost" className="mt-2 w-full">{t("nav.login")}</Button>
              </Link>
              <Link href={`/${locale}/register`} onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="mt-1 w-full">{t("nav.register")}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
