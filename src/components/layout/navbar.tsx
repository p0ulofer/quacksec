"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard") },
    { href: `/${locale}/domains`, label: t("nav.domains") },
    { href: `/${locale}/vulnerabilidades`, label: t("nav.vulnerabilities") },
    { href: `/${locale}/vulnerabilidades/planos`, label: t("nav.remediationPlans") },
    { href: `/${locale}/docs`, label: t("nav.docs") },
  ];

  const isLinkActive = (href: string) => {
    if (href.endsWith("/vulnerabilidades/planos")) {
      return pathname.startsWith(href);
    }
    if (href.endsWith("/vulnerabilidades")) {
      return pathname.startsWith(href) && !pathname.includes("/vulnerabilidades/planos");
    }
    return pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
  };

  const handleMobileLogout = () => {
    logout();
    setMobileOpen(false);
    router.push(`/${locale}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left Side: Brand & Logo */}
        <div className="flex items-center justify-start">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            aria-label="QuackSec Home"
          >
            <Image
              src={isDark ? "/logo-white.png" : "/logo3.png"}
              alt="QuackSec"
              width={30}
              height={30}
              className="h-7 w-auto sm:h-8"
              priority
            />
            <span className="font-serif text-lg tracking-tight sm:text-xl">
              QuackSec
            </span>
          </Link>
        </div>

        {/* Center: Horizontally Centered Navigation Links */}
        <nav className="hidden items-center justify-center gap-4 md:flex lg:gap-7">
          {isAuthenticated ? (
            navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center py-2 text-xs font-medium transition-colors hover:text-foreground lg:text-sm",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })
          ) : (
            <Link
              href={`/${locale}/docs`}
              className={cn(
                "relative flex items-center py-2 text-xs font-medium transition-colors hover:text-foreground lg:text-sm",
                pathname.startsWith(`/${locale}/docs`)
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t("nav.docs")}
              {pathname.startsWith(`/${locale}/docs`) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary" />
              )}
            </Link>
          )}
        </nav>

        {/* Right Side: Grouped Secondary Controls */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {/* Compact Language Selector */}
          <LanguageSwitcher />

          {/* Theme Toggle (Current Theme Icon only) */}
          <ThemeToggle />

          {/* User Profile or Auth Buttons */}
          {isAuthenticated ? (
            <UserNavDropdown />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href={`/${locale}/login`}>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-xs">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm" className="h-9 px-3.5 text-xs">
                  {t("nav.register")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3 sm:px-6">
          {isAuthenticated ? (
            navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })
          ) : (
            <Link
              href={`/${locale}/docs`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(`/${locale}/docs`)
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span>{t("nav.docs")}</span>
              {pathname.startsWith(`/${locale}/docs`) && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )}

          {/* Mobile Profile Actions when logged in */}
          {isAuthenticated ? (
            <div className="mt-2 border-t border-border/60 pt-2">
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user?.name || t("nav.profile")}</span>
              </Link>
              <button
                type="button"
                onClick={handleMobileLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 text-destructive" />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)}>
                <Button size="sm" variant="ghost" className="w-full justify-center">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href={`/${locale}/register`} onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full justify-center">
                  {t("nav.register")}
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
