"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const localeShortCodes: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    const segments = pathname.split("/");
    // replace locale in path e.g. /pt-BR/... or /en/...
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const currentShort = localeShortCodes[locale] || locale.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Selecionar idioma"
          title={`Idioma: ${localeNames[locale] || currentShort}`}
        >
          <Globe className="h-3.5 w-3.5 opacity-70" />
          <span className="tracking-wide">{currentShort}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {locales.map((l) => {
          const isSelected = l === locale;
          return (
            <DropdownMenuItem
              key={l}
              onClick={() => switchLocale(l)}
              className={cn(
                "flex items-center justify-between text-xs py-2 cursor-pointer",
                isSelected && "font-semibold text-primary"
              )}
            >
              <span>{localeNames[l]}</span>
              <span className={cn(
                "text-[10px] font-mono tracking-wider",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {localeShortCodes[l]}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
