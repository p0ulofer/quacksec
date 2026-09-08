"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SourceGroupKey } from "@/lib/vulnerability-config";
import { SOURCE_GROUPS } from "@/lib/vulnerability-config";

interface Props {
  active: Set<SourceGroupKey>;
  onToggle: (key: SourceGroupKey) => void;
  counts: Partial<Record<SourceGroupKey, number>>;
}

export function SourceFilter({ active, onToggle, counts }: Props) {
  const t = useTranslations();
  const hasActive = active.size > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => {
          for (const key of SOURCE_GROUPS.map((g) => g.key)) {
            if (active.has(key)) onToggle(key);
          }
        }}
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          !hasActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
      >
        {t("sourceFilter.all")}
      </button>
      {SOURCE_GROUPS.map((group) => {
        const isActive = active.has(group.key);
        const count = counts[group.key] ?? 0;
        return (
          <button
            key={group.key}
            onClick={() => onToggle(group.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : count === 0
                  ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground/50"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {t(`sourceGroup.${group.key}`)}
            <span className={cn("ml-1.5", isActive ? "opacity-80" : "opacity-50")}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}