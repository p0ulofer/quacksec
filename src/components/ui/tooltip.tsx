"use client";

import { cn } from "@/lib/utils";

/**
 * Tooltip leve (sem dependências) usado para explicar por que uma ação está
 * desabilitada. Funciona também ao redor de botões `disabled`, pois o hover é
 * capturado pelo wrapper, e é acessível por foco/teclado.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-center text-xs leading-snug text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
