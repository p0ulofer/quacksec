"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNavDropdown() {
  const { user, logout } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  // Get up to 2 initials or fallback to User icon
  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user?.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-foreground transition-all hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("nav.profile")}
          title={user?.name || t("nav.profile")}
        >
          {initials ? (
            <span className="text-xs font-semibold tracking-wider text-foreground">
              {initials}
            </span>
          ) : (
            <User className="h-4 w-4 text-foreground" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5" sideOffset={8}>
        {/* User Identity Header */}
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
            {initials || <User className="h-4 w-4" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {user?.name || "Usuário"}
            </span>
            <span className="text-[11px] font-medium text-primary">
              {t("nav.accountSub")}
            </span>
            {user?.email && (
              <span className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/profile`}
            className="flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{t("nav.account")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/profile`}
            className="flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>{t("nav.settings")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4 text-destructive" />
          <span>{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
