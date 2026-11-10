"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        isDark
          ? "Tema escuro (clique para alternar para claro)"
          : "Tema claro (clique para alternar para escuro)"
      }
      title={isDark ? "Tema escuro" : "Tema claro"}
    >
      {isDark ? (
        <Moon className="h-4 w-4 transition-transform hover:scale-110" />
      ) : (
        <Sun className="h-4 w-4 transition-transform hover:scale-110" />
      )}
    </Button>
  );
}
