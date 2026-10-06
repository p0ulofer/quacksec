"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScanStatus } from "@/lib/api";

interface StatusConfig {
  variant?: BadgeProps["variant"];
  className?: string;
  icon: LucideIcon;
  spin?: boolean;
  pulse?: boolean;
}

/**
 * Badge do status do scan. Cancelando (laranja, pulsando) e Cancelado
 * (cinza) são visualmente distintos de Em execução (âmbar).
 */
export function ScanStatusBadge({
  status,
  className,
}: {
  status: ScanStatus;
  className?: string;
}) {
  const t = useTranslations();

  const config: Record<ScanStatus, StatusConfig> = {
    pending: { variant: "outline", icon: Clock },
    running: { variant: "warning", icon: Loader2, spin: true },
    cancelling: {
      variant: "outline",
      icon: Loader2,
      spin: true,
      pulse: true,
      className:
        "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    cancelled: { variant: "secondary", icon: Ban },
    completed: { variant: "success", icon: CheckCircle2 },
    failed: { variant: "destructive", icon: XCircle },
  };

  const { variant, className: statusClassName, icon: Icon, spin, pulse } =
    config[status];

  return (
    <Badge
      variant={variant}
      className={cn("gap-1.5 whitespace-nowrap", statusClassName, className)}
      data-status={status}
    >
      <Icon
        className={cn(
          "h-3 w-3",
          spin && "animate-spin",
          pulse && "animate-pulse",
        )}
      />
      {t(`scanStatus.${status}`)}
    </Badge>
  );
}
